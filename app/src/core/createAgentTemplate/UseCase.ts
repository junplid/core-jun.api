import OpenAI from "openai";
import { prisma } from "../../adapters/Prisma/client";
import { CreateAgentTemplateDTO_I } from "./DTO";
import vm from "node:vm";
import { transformSync } from "esbuild";
import Joi from "joi";
import { webSocketEmitToRoom } from "../../infra/websocket";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { ulid } from "ulid";

export interface ICacheCreateAgentTemplate {
  nodeId: string;
  previous_response_id?: string;
  agent: any;
  flow: { nodes: any; edges: any };
  flowId: string;
  accountId: number;
}

function mapInputType(type: Input["type"], isMult?: boolean) {
  switch (type) {
    case "text":
    case "textarea":
      return Joi.string();
    case "number":
      return Joi.number();
    case "select":
      if (isMult) {
        return Joi.array().items(Joi.string());
      }
      return Joi.string();
    case "tags-input":
      return Joi.array().items(Joi.string());
  }
}

interface Input {
  name: string;
  required?: boolean;
  max?: number;
  min?: number;
  isMulti?: boolean;
  type: "text" | "number" | "textarea" | "select" | "tags-input";
}

type DataSocketMapCreate =
  | {
      label: string;
      type: "error" | "success" | "wait" | "runner";
      id: string;
    }
  | {
      type: "error-input";
      input: { path: string; text: string }[];
    };

const modelNotFlex = ["gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "o3-mini"];

const sleep = (time: number) => new Promise((s) => setTimeout(s, time * 1000));

export class CreateAgentTemplateUseCase {
  constructor() {}

  async run(dto: CreateAgentTemplateDTO_I) {
    (async () => {
      const socketAccount = webSocketEmitToRoom().account(dto.accountId);
      await new Promise((s) => setTimeout(s, 400));
      socketAccount.emit(
        `modal-agent-template-${dto.modalHash}`,
        {
          id: "1",
          type: "runner",
        } as DataSocketMapCreate,
        [],
      );
      await sleep(2);

      const business = await prisma.business.findFirst({
        where: { accountId: dto.accountId },
        select: { id: true },
      });

      if (!business) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            input: [
              { path: "root", text: "Workspace da conta não encontrado." },
            ],
            type: "error-input",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      let providerCredentialId: number | undefined = undefined;
      if (dto.providerCredentialId) {
        const credential = await prisma.providerCredential.findFirst({
          where: { id: dto.providerCredentialId, accountId: dto.accountId },
          select: { id: true, apiKey: true },
        });

        if (!credential) {
          socketAccount.emit(
            `modal-agent-template-${dto.modalHash}`,
            {
              input: [
                {
                  path: "providerCredentialId",
                  text: "Credencial de provedor não encontrada.",
                },
              ],
              type: "error-input",
            } as DataSocketMapCreate,
            [],
          );
          return;
        }

        const openai = new OpenAI({ apiKey: credential.apiKey });
        try {
          await openai.models.list({});
        } catch (error: any) {
          if (error.status === 401) {
            socketAccount.emit(
              `modal-agent-template-${dto.modalHash}`,
              {
                input: [
                  {
                    path: "providerCredentialId",
                    text: "A chave secreta do provedor não está autorizada.",
                  },
                ],
                type: "error-input",
              } as DataSocketMapCreate,
              [],
            );
            return;
          }
          socketAccount.emit(
            `modal-agent-template-${dto.modalHash}`,
            {
              input: [
                {
                  path: "providerCredentialId",
                  text: "Erro ao validar a chave secreta do provedor.",
                },
              ],
              type: "error-input",
            } as DataSocketMapCreate,
            [],
          );
          return;
        }
        providerCredentialId = dto.providerCredentialId;
      } else {
        if (!dto.apiKey) {
          socketAccount.emit(
            `modal-agent-template-${dto.modalHash}`,
            {
              input: [
                {
                  path: "apiKey",
                  text: `Campo obrigatório.`,
                },
              ],
              type: "error-input",
            } as DataSocketMapCreate,
            [],
          );
          return;
        }
        if (!dto.nameProvider) {
          socketAccount.emit(
            `modal-agent-template-${dto.modalHash}`,
            {
              input: [
                {
                  path: "nameProvider",
                  text: `Campo obrigatório.`,
                },
              ],
              type: "error-input",
            } as DataSocketMapCreate,
            [],
          );
          return;
        }

        const existingCredential = await prisma.providerCredential.findFirst({
          where: {
            accountId: dto.accountId,
            label: dto.nameProvider,
            provider: "openai",
            apiKey: dto.apiKey,
          },
          select: { id: true, label: true },
        });

        if (existingCredential) {
          socketAccount.emit(
            `modal-agent-template-${dto.modalHash}`,
            {
              input: [
                {
                  path: "apiKey",
                  text: `Esse provedor já existe. Selecione: ${existingCredential.label} na lista de provedores`,
                },
              ],
              type: "error-input",
            } as DataSocketMapCreate,
            [],
          );
          return;
        }

        try {
          const client = new OpenAI({ apiKey: dto.apiKey });
          await client.models.list();
        } catch (error: any) {
          if (error.status === 401) {
            socketAccount.emit(
              `modal-agent-template-${dto.modalHash}`,
              {
                input: [
                  {
                    path: "apiKey",
                    text: "Chave secreta não autorizada.",
                  },
                ],
                type: "error-input",
              } as DataSocketMapCreate,
              [],
            );
            return;
          }
          socketAccount.emit(
            `modal-agent-template-${dto.modalHash}`,
            {
              input: [
                {
                  path: "apiKey",
                  text: "Chave secreta invalida.",
                },
              ],
              type: "error-input",
            } as DataSocketMapCreate,
            [],
          );
          return;
        }

        const newProviderCredential = await prisma.providerCredential.create({
          data: {
            accountId: dto.accountId,
            apiKey: dto.apiKey,
            label: dto.nameProvider,
            provider: "openai",
          },
          select: { id: true },
        });
        providerCredentialId = newProviderCredential.id;
      }

      const findTemplate = await prisma.agentTemplates.findFirst({
        where: { id: dto.templatedId },
        select: {
          script_build_agentai_for_test: true,
          config_flow: true,
          tags: true,
          variables: true,
          Sections: { select: { name: true, inputs: true } },
          script_runner: true,
        },
      });
      if (!findTemplate?.script_build_agentai_for_test) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            input: [
              {
                path: "root",
                text: "Não foi possivel encontrar o template.",
              },
            ],
            type: "error-input",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }
      const schemaValidation = Joi.object(
        findTemplate.Sections.reduce<Record<string, Joi.ObjectSchema>>(
          (acc, section) => {
            const inputsSchema = section.inputs.reduce<
              Record<string, Joi.Schema>
            >((inputsAcc, input) => {
              // @ts-expect-error
              const inputJson = input as Input;

              let fieldSchema = mapInputType(inputJson.type);

              if (inputJson.min) {
                fieldSchema = fieldSchema.min(inputJson.min);
              }

              if (inputJson.max) {
                fieldSchema = fieldSchema.max(inputJson.max);
              }

              if (inputJson.required) {
                fieldSchema = fieldSchema.required();
              } else {
                fieldSchema = fieldSchema.optional();
              }

              inputsAcc[inputJson.name] = fieldSchema;
              return inputsAcc;
            }, {});

            acc[section.name] = Joi.object(inputsSchema);
            return acc;
          },
          {},
        ),
      );
      const validation = schemaValidation.validate(dto.fields, {
        abortEarly: false,
      });
      if (validation.error) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            input: validation.error.details.map((element) => ({
              path: `fields.${element.path.join(".")}`,
              text: "Campo obrigatório.",
            })),
            type: "error-input",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      socketAccount.emit(
        `modal-agent-template-${dto.modalHash}`,
        {
          id: "1",
          type: "success",
        } as DataSocketMapCreate,
        [],
      );

      let dataDependence: {
        agent: any;
        flow: any;
        tagsId?: number[];
        variablesId?: number[];
      } | null = null;
      try {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "2",
            type: "runner",
          } as DataSocketMapCreate,
          [],
        );
        await sleep(3);

        const jsCode = transformSync(
          findTemplate.script_build_agentai_for_test,
          {
            loader: "ts",
          },
        ).code;

        const context = {
          console,
          props: { sections_inputs: dto.fields },
          setTimeout,
        };

        vm.createContext(context);

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

        dataDependence = {
          agent: result,
          flow: flowJson,
          tagsId: tags.map((s) => s.id),
          variablesId: variabels.map((s) => s.id),
        };
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "2",
            type: "success",
          } as DataSocketMapCreate,
          [],
        );
      } catch (error) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "2",
            label: "Error ao tentar criar as dependências.",
            type: "error",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      const nodeUnique = Math.floor(Date.now() / 1000);
      let agentAIId: number | null = null;
      try {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "3",
            type: "runner",
          } as DataSocketMapCreate,
          [],
        );
        await sleep(4);

        const { id } = await prisma.agentAI.create({
          data: {
            accountId: dto.accountId,
            providerCredentialId: providerCredentialId,
            ...dataDependence.agent,
            name: `${dataDependence.agent.name} - ${nodeUnique}`,
            AgentAIOnBusiness: { create: { businessId: business.id } },
            temperature: dataDependence.agent.temperature || 1,
            service_tier: modelNotFlex.some(
              (f) => f === dataDependence.agent.model,
            )
              ? undefined
              : dataDependence.agent.service_tier,
          },
          select: { id: true },
        });
        agentAIId = id;
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "3",
            type: "success",
          } as DataSocketMapCreate,
          [],
        );
      } catch (error) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "3",
            label: "Error ao tentar criar Assistente de IA.",
            type: "error",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      let flowId: null | string = null;
      try {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "4",
            type: "runner",
          } as DataSocketMapCreate,
          [],
        );
        await sleep(2);

        await mongo();
        const flow = await ModelFlows.create({
          name: `Flow for ${dataDependence.agent.name} - ${nodeUnique}`,
          accountId: dto.accountId,
          businessIds: [business.id],
          type: "universal",
          agentId: agentAIId,
          _id: ulid(),
          data: {
            metrics: {},
            ...dataDependence.flow,
          },
        });
        flowId = flow._id as string;
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "4",
            type: "success",
          } as DataSocketMapCreate,
          [],
        );
      } catch (error) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "4",
            label: "Error ao criar Fluxo de conversa.",
            type: "error",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      let connectionId: null | number = null;
      try {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "5",
            type: "runner",
          } as DataSocketMapCreate,
          [],
        );
        await sleep(1);

        const { id } = await prisma.connectionWA.create({
          data: {
            name: `Connection for ${dataDependence.agent.name} - ${nodeUnique}`,
            description: `Criada para o Assistente de IA "${dataDependence.agent.name} - ${nodeUnique}"`,
            type: "chatbot",
            businessId: business.id,
            AgentAI: { connect: { id: agentAIId } },
          },
          select: { id: true },
        });
        connectionId = id;
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "5",
            type: "success",
          } as DataSocketMapCreate,
          [],
        );
      } catch (error) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "5",
            label: "Error ao criar Conexão WhatsApp.",
            type: "error",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }

      try {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "6",
            type: "runner",
          } as DataSocketMapCreate,
          [],
        );
        await sleep(3);

        const jsCode = transformSync(findTemplate.script_runner, {
          loader: "ts",
        }).code;

        async function createChatbot({
          TimeToRestart,
          ...data
        }: {
          TimeToRestart?: {
            value: number;
            type: "seconds" | "minutes" | "hours" | "days";
          };
          addToLeadTagsIds?: number[];
          fallback?: string;
          trigger?: string;
          destLink?: string;
        }) {
          await prisma.chatbot.create({
            data: {
              accountId: dto.accountId,
              connectionWAId: connectionId,
              flowId: flowId!,
              name: `Chatbot for ${dataDependence!.agent.name} - ${nodeUnique}`,
              ...data,
              ...(TimeToRestart && {
                TimeToRestart: { create: TimeToRestart },
              }),
              AgentAI: { connect: { id: agentAIId! } },
              businessId: business!.id,
              status: true,
              description: `Criada para o Assistente de IA "${dataDependence!.agent.name} - ${nodeUnique}"`,
            },
            select: {
              createAt: true,
            },
          });
        }

        const context = {
          console,
          props: {
            sections_inputs: dto.fields,
            accountId: dto.accountId,
            db: { createChatbot },
            AgentTemplate: {
              tagsId: dataDependence.tagsId,
              variablesId: dataDependence.variablesId,
            },
          } as {
            accountId: number;
            db: {
              createChatbot: (data: any) => Promise<void>;
            };
            sections_inputs: Record<string, Record<string, number | string>>;
            AgentTemplate: {
              variablesId: number[];
              tagsId: number[];
            };
          },
          setTimeout,
        };

        vm.createContext(context);

        const script = new vm.Script(`
   (async () => {
     ${jsCode}
     if (typeof runner_agent_test === 'function') {
       await runner(props);
     }
   })()
  `);

        await script.runInContext(context, { timeout: 5000 });
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "6",
            label: "Chatbot.",
            type: "success",
          } as DataSocketMapCreate,
          [],
        );
      } catch (error) {
        socketAccount.emit(
          `modal-agent-template-${dto.modalHash}`,
          {
            id: "6",
            label: "Error ao criar Chatbot de recepção.",
            type: "error",
          } as DataSocketMapCreate,
          [],
        );
        return;
      }
    })();

    return {
      message: "OK.",
      status: 200,
    };
  }
}
