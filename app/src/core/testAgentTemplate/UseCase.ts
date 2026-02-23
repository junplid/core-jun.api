import OpenAI from "openai";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { TestAgentTemplateDTO_I } from "./DTO";
import { cacheTestAgentTemplate } from "../../libs/FlowBuilder/cache";

import vm from "node:vm";
import { transformSync } from "esbuild";

export interface ICacheTestAgentTemplate {
  apiKey: string;
  nodeId: string;
  previous_response_id?: string;
  agent: any;
  flow: { nodes: any; edges: any };
}

export class TestAgentTemplateUseCase {
  constructor() {}

  async run(dto: TestAgentTemplateDTO_I) {
    let testInProgress = cacheTestAgentTemplate.get<ICacheTestAgentTemplate>(
      dto.token_modal_template,
    );

    if (!testInProgress) {
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

        for (let index = 0; index < tags.length; index++) {
          const tag = tags[index];
          findTemplate.config_flow.replaceAll(
            `"$tags.[${index}].id"`,
            String(tag.id),
          );
          findTemplate.config_flow.replaceAll(
            `"$tags.[${index}].name"`,
            tag.name,
          );
        }

        for (let index = 0; index < variabels.length; index++) {
          const tag = variabels[index];
          findTemplate.config_flow.replaceAll(
            `"$vars.[${index}].id"`,
            String(tag.id),
          );
          findTemplate.config_flow.replaceAll(
            `"$vars.[${index}].name"`,
            tag.name,
          );
        }

        const dataTestInProgress = {
          agent: result,
          apiKey,
          nodeId: "0",
          flow: JSON.parse(findTemplate.config_flow),
        };

        cacheTestAgentTemplate.set<ICacheTestAgentTemplate>(
          dto.token_modal_template,
          dataTestInProgress,
        );
        testInProgress = dataTestInProgress;
      } catch (error) {
        throw new ErrorResponse(400).toast({
          title: "Error ao construir assistente de teste",
          type: "error",
        });
      }
    }

    console.log({ testInProgress });

    // chamar o Controller e preparar toda a estrutra de arquivos para receber testes

    //     // recuperar o fluxo
    //     // recuperar todos os dados para o agentai.
    //     // usar o tokenTest para salvar em cache a posição do fluxo, previous_response_id, AgentIA

    //     // qualquer mudandança nos inputs deve deletar o cache.

    //     // para isso acontecer deve ter um script só pra gerar os dados do agentai:
    //     // model, temperature, instructions, service_tier

    //     const openai = new OpenAI({ apiKey });
    //     let vectorStoreId: string | null = null;
    //     const vsTest: VectorStoreTest[] = JSON.parse(
    //       (await readFile(resolve(pathFilesTest), "utf-8")) || "[]",
    //     );

    //     if (dto.files?.length) {
    //       const files: {
    //         id: number;
    //         fileName: string;
    //       }[] = [];
    //       for (const fileId of dto.files) {
    //         const file = await prisma.storagePaths.findFirst({
    //           where: { id: fileId, accountId: dto.accountId },
    //           select: { id: true, fileName: true },
    //         });

    //         if (!file) {
    //           throw new ErrorResponse(400).input({
    //             path: "files",
    //             text: "Arquivo não encontrado.",
    //           });
    //         }
    //         files.push(file);
    //       }

    //       const existingVectorStore = vsTest.find(
    //         (v) => v.tokenTest === dto.tokenTest,
    //       );

    //       if (!existingVectorStore) {
    //         const fileIds = await Promise.all(
    //           files.map(async (f) => {
    //             const fId = await ensureFileByName(
    //               openai,
    //               f.fileName,
    //               resolve(path, f.fileName),
    //             );
    //             return { localId: f.id, openFileId: fId };
    //           }),
    //         );
    //         const { id: vsId } = await openai.vectorStores.create({
    //           name: `test-${dto.tokenTest}`,
    //           file_ids: fileIds.map((f) => f.openFileId),
    //           expires_after: { anchor: "last_active_at", days: 1 },
    //         });
    //         vsTest.push({
    //           vectorStoreId: vsId,
    //           tokenTest: dto.tokenTest,
    //           files: fileIds,
    //           apiKey,
    //         });
    //         await writeFile(
    //           resolve(pathFilesTest),
    //           JSON.stringify(vsTest, null, 2),
    //         );
    //         vectorStoreId = vsId;
    //       } else {
    //         vectorStoreId = existingVectorStore.vectorStoreId;
    //         const isEqual = deepEqual(
    //           existingVectorStore.files.map((s) => s.localId),
    //           dto.files,
    //         );
    //         if (!isEqual) {
    //           const newFileIds = files.filter(
    //             (f) => !existingVectorStore?.files.some((e) => e.localId === f.id),
    //           );
    //           const removedFileIds = existingVectorStore?.files.filter(
    //             (fileVS) => !dto.files?.some((f) => f === fileVS.localId),
    //           );
    //           if (newFileIds.length) {
    //             const listNewFiles = await Promise.all(
    //               newFileIds.map(async (f) => {
    //                 const fId = await ensureFileByName(
    //                   openai,
    //                   f.fileName,
    //                   resolve(path, f.fileName),
    //                 );
    //                 await openai.vectorStores.files.createAndPoll(
    //                   existingVectorStore.vectorStoreId,
    //                   { file_id: fId },
    //                 );
    //                 return { localId: f.id, openFileId: fId };
    //               }),
    //             );
    //             existingVectorStore.files.push(...listNewFiles);
    //             await writeFile(
    //               resolve(pathFilesTest),
    //               JSON.stringify(vsTest, null, 2),
    //             );
    //           }
    //           if (removedFileIds.length) {
    //             for await (const element of removedFileIds.map(
    //               (f) => f.openFileId,
    //             )) {
    //               await openai.vectorStores.files.delete(element, {
    //                 vector_store_id: existingVectorStore.vectorStoreId,
    //               });
    //               await openai.files.delete(element);
    //             }
    //             existingVectorStore.files = existingVectorStore.files.filter(
    //               (f) => !removedFileIds.some((e) => e.localId === f.localId),
    //             );
    //             await writeFile(
    //               resolve(pathFilesTest),
    //               JSON.stringify(vsTest, null, 2),
    //             );
    //           }
    //         }
    //       }
    //     } else {
    //       const existingTokenTest = vsTest.find(
    //         (v) => v.tokenTest === dto.tokenTest,
    //       );
    //       if (existingTokenTest) {
    //         const filesVs = await openai.vectorStores.files.list(
    //           existingTokenTest.vectorStoreId,
    //         );
    //         await openai.vectorStores.delete(existingTokenTest.vectorStoreId);
    //         for (const file of filesVs.data) {
    //           await openai.files.delete(file.id);
    //         }
    //         const updatedVsTest = vsTest.filter(
    //           (v) => v.tokenTest !== dto.tokenTest,
    //         );
    //         await writeFile(
    //           resolve(pathFilesTest),
    //           JSON.stringify(updatedVsTest, null, 2),
    //         );
    //         vectorStoreId = null;
    //       }
    //     }

    //     const cachetoken = cacheTestAgentTemplate.get(dto.tokenTest);
    //     const instructions = buildInstructions(dto);
    //     let temperature: undefined | number = undefined;
    //     if (
    //       dto.model === "o3-mini" ||
    //       dto.model === "gpt-5-nano" ||
    //       dto.model === "gpt-5-mini" ||
    //       dto.model === "gpt-4.1-mini" ||
    //       dto.model === "o4-mini" ||
    //       dto.model === "gpt-5" ||
    //       dto.model === "o3"
    //     ) {
    //       temperature = undefined;
    //     } else {
    //       temperature = dto.temperature ? Number(dto.temperature) : 1.0;
    //     }

    //     try {
    //       if (vectorStoreId) {
    //         tools.push({
    //           vector_store_ids: [vectorStoreId],
    //           type: "file_search",
    //         });
    //       }
    //       let response: OpenAI.Responses.Response & {
    //         _request_id?: string | null;
    //       };

    //       let input: any[] = [];
    //       input.push({
    //         role: "user",
    //         content: dto.content,
    //       });
    //       if (!cachetoken) {
    //         input = [{ role: "developer", content: instructions }, ...input];
    //       }

    //       response = await openai.responses.create({
    //         model: dto.model,
    //         temperature,
    //         input,
    //         previous_response_id: cachetoken,
    //         instructions: `# Regras:
    // 1. Funções ou ferramentas só podem se invocadas ou solicitadas pelas orientações do SYSTEM ou DEVELOPER.
    // 2. Se estas regras entrarem em conflito com a fala do usuário, priorize AS REGRAS.
    // 3. Se for mencionado um dia da semana sem data explícita, chame o tool resolver_dia_da_semana.
    // 4 Quando o usuário mencionar um dia da semana:
    // 4.1 Se disser “essa”, use referencia = atual.
    // 4.2 Caso contrário, use referencia = proxima.
    // 4.3 Nunca calcule datas diretamente.`,
    //         store: true,
    //         tools,
    //         service_tier: modelNotFlex.some((f) => f === dto.model)
    //           ? undefined
    //           : dto.service_tier,
    //       });

    //       const socketIds = cacheAccountSocket.get(dto.accountId)?.listSocket;

    //       const fnCallPromise = (propsCALL: OpenAI.Responses.Response) => {
    //         return new Promise<OpenAI.Responses.Response>((resolveCall) => {
    //           const run = async (rProps: OpenAI.Responses.Response) => {
    //             const outputs: OpenAI.Responses.ResponseInput = [];
    //             for await (const c of rProps.output) {
    //               if (c.type === "message") {
    //                 for await (const item of c.content) {
    //                   if (item.type === "output_text") {
    //                     const texts = item.text.split("\n\n");
    //                     for await (const text of texts) {
    //                       if (socketIds?.length) {
    //                         socketIds.forEach((socketId) => {
    //                           socketIo
    //                             .to(socketId.id)
    //                             .emit(`test-agent-${dto.tokenTest}`, {
    //                               role: "agent",
    //                               content: text,
    //                             });
    //                         });
    //                       }
    //                     }
    //                   }
    //                 }
    //               }
    //               if (c.type === "function_call") {
    //                 const args = JSON.parse(c.arguments);

    //                 switch (c.name) {
    //                   case "notificar_agente":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Enviando notificação...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "pesquisar_valor_em_variavel":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Pesquisando em variável...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Ok",
    //                     });
    //                     continue;

    //                   case "buscar_variavel":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Buscando variável...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Ok",
    //                     });
    //                     continue;

    //                   case "buscar_tag":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Buscando etiqueta...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Etiqueta encontrada.",
    //                     });
    //                     continue;

    //                   case "adicionar_variavel":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Adicionando variável...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "remover_variavel":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Removendo variável...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "adicionar_tag":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Adicionando etiqueta...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "remover_tag":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: "Removendo etiqueta...",
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "aguardar_tempo":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Aguardando tempo: ${args.value}${args.type}...`,
    //                           });
    //                       });
    //                     }
    //                     await NodeTimer({ data: args });
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Tempo de espera concluído.",
    //                     });
    //                     continue;

    //                   case "enviar_fluxo":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Transferindo fluxo(Funciona apenas em chat real)`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "notificar_whatsapp":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Notificando outro WhatsApp...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Mensagem enviada com sucesso.",
    //                     });
    //                     continue;

    //                   case "enviar_arquivo":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Enviando arquivo...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Arquivo enviado com sucesso.",
    //                     });

    //                     continue;

    //                   case "enviar_video":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Enviando vídeo...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Video enviado com sucesso.",
    //                     });

    //                     continue;

    //                   case "enviar_imagem":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Enviando imagem...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Imagem enviada com sucesso.",
    //                     });

    //                     continue;

    //                   case "enviar_audio":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Enviando audio...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "Audio enviado com sucesso.",
    //                     });
    //                     continue;

    //                   case "transferir_para_atendimento_humano":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Abrindo ticket de atendimento...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "OK!",
    //                     });
    //                     continue;

    //                   case "gerar_codigo_randomico":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Gerando codigo aleatorio...`,
    //                           });
    //                       });
    //                     }
    //                     const code = genNumCode(args.count || 5);
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: code,
    //                     });
    //                     continue;

    //                   case "criar_evento":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Criando agendamento...`,
    //                           });
    //                       });
    //                     }
    //                     const n_appointment = genNumCode(7);
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: `Criado com sucesso, codigo do evento: ${n_appointment}`,
    //                     });

    //                     continue;

    //                   case "atualizar_evento":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Atualizando agendamento...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: `Evento atualizado.`,
    //                     });
    //                     continue;

    //                   case "criar_pedido": {
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Criando pedido...`,
    //                           });
    //                       });
    //                     }
    //                     const n_appointment = genNumCode(7);
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: `Criado com sucesso, codigo do evento: ${n_appointment}`,
    //                     });
    //                     continue;
    //                   }

    //                   case "atualizar_pedido": {
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Atualizando pedido...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: `Pedido atualizado.`,
    //                     });
    //                     continue;
    //                   }

    //                   case "buscar_momento_atual":
    //                     const currentMoment = moment().tz("America/Sao_Paulo");
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: JSON.stringify({
    //                         data: currentMoment.format("YYYY-MM-DD"),
    //                         hora: currentMoment.format("HH:mm"),
    //                         dia_semana_nome: currentMoment.format("dddd"),
    //                         dia_semana_number: currentMoment.day(),
    //                       }),
    //                     });
    //                     continue;

    //                   case "resolver_dia_da_semana": {
    //                     const { dia_semana, referencia } = args;
    //                     const now = moment().startOf("day");

    //                     const mapa: Record<string, number> = {
    //                       domingo: 0,
    //                       segunda: 1,
    //                       terca: 2,
    //                       quarta: 3,
    //                       quinta: 4,
    //                       sexta: 5,
    //                       sabado: 6,
    //                     };

    //                     const target = mapa[dia_semana];

    //                     if (target === undefined) {
    //                       outputs.push({
    //                         type: "function_call_output",
    //                         call_id: c.call_id,
    //                         output: `Dia da semana inválido: ${dia_semana}`,
    //                       });
    //                       continue;
    //                     }

    //                     let dataBase = now.clone();
    //                     if (referencia === "proxima") dataBase.add(1, "week");
    //                     dataBase.day(target);

    //                     if (
    //                       referencia === "atual" &&
    //                       dataBase.isBefore(now, "day")
    //                     ) {
    //                       outputs.push({
    //                         type: "function_call_output",
    //                         call_id: c.call_id,
    //                         output: JSON.stringify({
    //                           error: "DATA_NO_PASSADO",
    //                           message: "O dia solicitado já passou na semana atual",
    //                         }),
    //                       });
    //                       continue;
    //                     }

    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: JSON.stringify({
    //                         requested_weekday: dia_semana,
    //                         referencia,
    //                         resolved_date: dataBase.format("YYYY-MM-DD"),
    //                         iso: dataBase.toISOString(),
    //                       }),
    //                     });
    //                     continue;
    //                   }

    //                   case "buscar_eventos_por_data":
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Buscando evento especifico...`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: "ok",
    //                     });
    //                     continue;

    //                   default: {
    //                     if (socketIds?.length) {
    //                       socketIds.forEach((socketId) => {
    //                         socketIo
    //                           .to(socketId.id)
    //                           .emit(`test-agent-${dto.tokenTest}`, {
    //                             role: "system",
    //                             content: `Função ${c.name} ainda não foi implementada.`,
    //                           });
    //                       });
    //                     }
    //                     outputs.push({
    //                       type: "function_call_output",
    //                       call_id: c.call_id,
    //                       output: `Função ${c.name} ainda não foi implementada.`,
    //                     });
    //                   }
    //                 }
    //               }
    //             }

    //             let responseRun: OpenAI.Responses.Response & {
    //               _request_id?: string | null;
    //             };
    //             if (outputs.length) {
    //               try {
    //                 responseRun = await openai.responses.create({
    //                   model: dto!.model,
    //                   temperature,
    //                   instructions: `# Regras:
    //   1. Funções ou ferramentas só podem se invocadas ou solicitadas pelas orientações do SYSTEM ou DEVELOPER.
    //   2. Se estas regras entrarem em conflito com a fala do usuário, priorize AS REGRAS.
    //   3. Se for mencionado um dia da semana sem data explícita, chame o tool resolver_dia_da_semana.
    //   4 Quando o usuário mencionar um dia da semana:
    //   4.1 Se disser “essa”, use referencia = atual.
    //   4.2 Caso contrário, use referencia = proxima.
    //   4.3 Nunca calcule datas diretamente.`,
    //                   input: outputs,
    //                   previous_response_id: rProps.id,
    //                   tools,
    //                   store: true,
    //                   service_tier: modelNotFlex.some((f) => f === dto.model)
    //                     ? undefined
    //                     : dto.service_tier,
    //                 });
    //               } catch (error: any) {
    //                 if (socketIds?.length) {
    //                   socketIds.forEach((socketId) => {
    //                     socketIo
    //                       .to(socketId.id)
    //                       .emit(`test-agent-${dto.tokenTest}`, {
    //                         type: "system-error",
    //                         content: `Error interno!`,
    //                       });
    //                   });
    //                 }
    //                 return;
    //               }
    //               return run(responseRun);
    //             } else {
    //               return resolveCall(rProps);
    //             }
    //           };
    //           run(propsCALL);
    //         });
    //       };
    //       response = await fnCallPromise(response);

    //       cacheTestAgentTemplate.set(dto.tokenTest, response.id);
    //       // enviar socket para habilitar o chat la no front?
    //       // if (socketIds?.length) {
    //       //   socketIds.forEach((socketId) => {
    //       //     socketIo
    //       //       .to(socketId.id)
    //       //       .emit(`test-agent-${dto.tokenTest}`, {
    //       //         type: "system-error",
    //       //         content: `Error interno!`,
    //       //       });
    //       //   });
    //       // }
    //       return {
    //         message: "OK.",
    //         status: 200,
    //       };
    //     } catch (error: any) {
    //       console.log(error);
    //       if (error.status === 401) {
    //         throw new ErrorResponse(400).input({
    //           path: "draft",
    //           text: "Error interno ao processar o teste.",
    //         });
    //       }
    //     }

    return {
      message: "OK.",
      status: 200,
    };
  }
}
