import OpenAI from "openai";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { TestAgentTemplateDTO_I } from "./DTO";
import { cacheTestAgentTemplate } from "../../libs/FlowBuilder/cache";

import vm from "node:vm";
import { transformSync } from "esbuild";
import { NodeControler } from "../../libs/FlowBuilder/Control";
import { nanoid } from "nanoid";
import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";

export interface ICacheTestAgentTemplate {
  nodeId: string;
  previous_response_id?: string;
  agent: any;
  flow: { nodes: any; edges: any };
  flowId: string;
  accountId: number;
}

export class TestAgentTemplateUseCase {
  constructor() {}

  async run(dto: TestAgentTemplateDTO_I) {
    const business = await prisma.business.findFirst({
      where: { accountId: dto.accountId },
      select: { id: true },
    });

    if (!business) {
      throw new ErrorResponse(401);
    }

    let testInProgress = cacheTestAgentTemplate.get<ICacheTestAgentTemplate>(
      dto.token_modal_chat_template,
    );

    if (!testInProgress) {
      console.log("TESTE NÃO ENCONTRADO ==");
      let apiKey: null | string = null;

      if (dto.providerCredentialId) {
        const credential = await prisma.providerCredential.findFirst({
          where: { id: dto.providerCredentialId, accountId: dto.accountId },
          select: { id: true, apiKey: true },
        });

        if (!credential) {
          throw new ErrorResponse(400).input({
            path: "providerCredentialId",
            text: "Credencial de provedor não encontrada",
          });
        }

        const openai = new OpenAI({ apiKey: credential.apiKey });
        try {
          await openai.models.list({});
          apiKey = credential.apiKey;
        } catch (error: any) {
          if (error.status === 401) {
            throw new ErrorResponse(400).input({
              path: "providerCredentialId",
              text: "A chave secreta do provedor não está autorizada.",
            });
          }
          throw new ErrorResponse(400).input({
            path: "providerCredentialId",
            text: "Erro ao validar a chave secreta do provedor.",
          });
        }
      } else {
        const openai = new OpenAI({ apiKey: dto.apiKey });
        try {
          await openai.models.list({});
          apiKey = dto.apiKey!;
        } catch (error: any) {
          if (error.status === 401) {
            throw new ErrorResponse(400).input({
              path: "apiKey",
              text: "Chave secreta não autorizada.",
            });
          }
          throw new ErrorResponse(400).input({
            path: "apiKey",
            text: "Chave secreta invalida.",
          });
        }
      }

      if (!apiKey) {
        throw new ErrorResponse(400).input({
          path: "apiKey",
          text: "Chave de API não informada",
        });
      }

      const findTemplate = await prisma.agentTemplates.findFirst({
        where: { id: dto.templatedId },
        select: {
          script_build_agentai_for_test: true,
          config_flow: true,
          tags: true,
          variables: true,
        },
      });

      if (!findTemplate?.script_build_agentai_for_test) {
        throw new ErrorResponse(400).toast({
          title: "Template não existe",
          description: "Não foi possivel encontrar o template.",
          type: "error",
        });
      }

      const jsCode = transformSync(findTemplate.script_build_agentai_for_test, {
        loader: "ts",
      }).code;

      const context = {
        console,
        props: { sections_inputs: dto.fields },
        setTimeout,
      };

      vm.createContext(context);

      try {
        const script = new vm.Script(`
  (() => {
    ${jsCode} 
    if (typeof runner_agent_test === 'function') {
      return runner_agent_test(props);
    }
  })()
`);

        const result = script.runInContext(context, { timeout: 5000 });

        const tags = await Promise.all(
          findTemplate.tags.map(async (name) => {
            let tag = await prisma.tag.findFirst({
              where: {
                name,
                accountId: dto.accountId,
              },
              select: { id: true },
            });
            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name,
                  accountId: dto.accountId,
                  type: "contactwa",
                },
                select: { id: true },
              });
            }

            return { name, id: tag.id };
          }),
        );

        const variabels = await Promise.all(
          findTemplate.variables.map(async (name) => {
            let vari = await prisma.variable.findFirst({
              where: {
                name,
                accountId: dto.accountId,
                type: "dynamics",
              },
              select: { id: true },
            });
            if (!vari) {
              vari = await prisma.variable.create({
                data: {
                  name,
                  accountId: dto.accountId,
                  type: "dynamics",
                },
                select: { id: true },
              });
            }

            return { name, id: vari.id };
          }),
        );

        const flowJson = JSON.parse(findTemplate.config_flow);

        flowJson.nodes = flowJson.nodes.map((node: any) => {
          if (node.type === "NodeAddTags") {
            node.data.list = node.data?.list?.map((item: string | number) => {
              if (typeof item === "string") {
                return tags.find((_, i) => item === `$tags.[${i}].id`)?.id || 0;
              }
              return item;
            });
          }
          if (node.type === "NodeAddVariables") {
            node.data.list = node.data?.list?.map(
              (item: { id: number | string; value: string }) => {
                if (typeof item.id === "string") {
                  const nextId =
                    variabels.find((_, i) => item.id === `$tags.[${i}].id`)
                      ?.id || 0;
                  return (item.id = nextId);
                }
                return item;
              },
            );
          }
          return node;
        });

        // for (let index = 0; index < variabels.length; index++) {
        //   const tag = variabels[index];
        //   findTemplate.config_flow = findTemplate.config_flow.replaceAll(
        //     `'$vars.[${index}].id'`,
        //     String(tag.id),
        //   );
        //   findTemplate.config_flow = findTemplate.config_flow.replaceAll(
        //     `'$vars.[${index}].name'`,
        //     tag.name,
        //   );
        // }

        const dataTestInProgress = {
          agent: { ...result, apiKey },
          nodeId: "0",
          flow: flowJson,
          flowId: "main",
          accountId: dto.accountId,
        };

        cacheTestAgentTemplate.set<ICacheTestAgentTemplate>(
          dto.token_modal_chat_template,
          dataTestInProgress,
        );
        testInProgress = dataTestInProgress;
      } catch (error) {
        throw new ErrorResponse(400).toast({
          title: "Error ao construir assistente de teste",
          type: "error",
        });
      }
    } else {
      console.log("TESTE AINDA EM CACHE");
    }

    const { ContactsWAOnAccount, ...contactWA } =
      await prisma.contactsWA.upsert({
        where: {
          completeNumber_page_id_channel: {
            completeNumber: "5599999999999",
            channel: "whatsapp",
            page_id: "testing",
          },
        },
        create: {
          completeNumber: "5599999999999",
          page_id: "testing",
          channel: "whatsapp",
          ContactsWAOnAccount: {
            create: {
              accountId: dto.accountId,
              name: "number_testing",
            },
          },
        },
        update: {},
        select: {
          id: true,
          ContactsWAOnAccount: {
            where: { accountId: dto.accountId },
            select: { id: true },
          },
        },
      });

    if (!ContactsWAOnAccount.length) {
      const { id } = await prisma.contactsWAOnAccount.create({
        data: {
          name: "number_testing",
          accountId: dto.accountId,
          contactWAId: contactWA.id,
        },
        select: { id: true },
      });
      ContactsWAOnAccount.push({ id });
    }

    NodeControler({
      mode: "testing",
      accountId: dto.accountId,
      businessId: business.id,
      ...testInProgress.flow,
      flowId: testInProgress.flowId,
      message: dto.content,
      oldNodeId: testInProgress.nodeId,
      token_modal_chat_template: dto.token_modal_chat_template,
      type: "running",
      previous_response_id: testInProgress.previous_response_id,
      contactAccountId: ContactsWAOnAccount[0].id,
      lead_id: "5599999999999",
      currentNodeId: testInProgress.nodeId,
      action: null,
      actions: {
        onFinish: async (vl) => {
          console.log("onFinish", JSON.stringify(vl, null, 2));
          cacheTestAgentTemplate.del(dto.token_modal_chat_template);
        },
        onExecutedNode: async (node) => {
          testInProgress.nodeId = node.id;
          cacheTestAgentTemplate.ttl(dto.token_modal_chat_template, 600);
        },
        onEnterNode: async (node) => {
          testInProgress.nodeId = node.id;
          cacheTestAgentTemplate.ttl(dto.token_modal_chat_template, 600);
        },
      },
    });

    return {
      message: "OK.",
      status: 200,
    };
  }
}
