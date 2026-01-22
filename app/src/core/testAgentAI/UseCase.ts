import OpenAI from "openai";
import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { TestAgentAIDTO_I } from "./DTO";
import { cacheTestAgentAI } from "../../adapters/Baileys/Cache";
import moment from "moment-timezone";
import { resolve } from "path";
import { createReadStream, readFile, writeFile } from "fs-extra";
import deepEqual from "fast-deep-equal";
import { NodeTimer } from "../../libs/FlowBuilder/nodes/Timer";
import { genNumCode } from "../../utils/genNumCode";
import { cacheAccountSocket } from "../../infra/websocket/cache";
import { socketIo } from "../../infra/express";

const tools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "pesquisar_valor_em_variavel",
    description: "Busca linhas na variável que correspondem com a query.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: {
          type: "string",
          description: "Query de busca",
        },
        name: {
          type: "string",
          description: "Nome da variável",
        },
      },
      required: ["query", "name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "notificar_agente",
    description:
      "Use para enviar notificação/informação para outro agente alvo.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "ID do agente alvo.",
        },
        text: {
          type: "string",
          description: "Informação que deve ser enviada para esse agente.",
        },
      },
      required: ["id", "text"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "buscar_variavel",
    description: "Use para buscar o ID e valor de uma variável.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome da variável que deseja buscar.",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "adicionar_variavel",
    description: "Atribuir valor a uma variavel do usuario",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: "string", description: "Nome da variável." },
        value: { type: "string", description: "Valor da variável" },
      },
      required: ["name", "value"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "remover_variavel",
    description: "Remove uma variavel do usuário.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome da variável.",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "adicionar_tag",
    description: "Adiciona uma tag/etiqueta ao usuário.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome da tag/etiqueta.",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "remover_tag",
    description: "Remove uma tag/etiqueta do usuário.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome da tag/etiqueta.",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "sair_node",
    description: "tringger: /[sair_node, <Nome da saída>]",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome da saída do node",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "enviar_fluxo",
    description: "Use para transferir o usuário para outro fluxograma/fluxo.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome do fluxo",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "buscar_tag",
    description: "Use para saber se a tag/etiqueta está associada ao usuário.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: {
          type: "string",
          description: "Nome da tag/etiqueta.",
        },
      },
      required: ["name"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "aguardar_tempo",
    description: "Use para pausar/aguardar um tempo para voltar a interagir.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        value: {
          type: "number",
          description: "Quantidade de tempo.",
        },
        type: {
          type: "string",
          enum: ["minutes", "hours", "days", "seconds"],
          description: "Unidade de tempo",
        },
      },
      required: ["value", "type"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "notificar_whatsapp",
    description: "Use para notificar/enviar mensagem para outro whatsapp",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        phone: {
          type: "string",
          description: "O número do contato.",
        },
        text: {
          type: "string",
          description: "A mensagem",
        },
      },
      required: ["phone", "text"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "enviar_arquivo",
    description: "Use para enviar arquivo",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "Id do arquivo.",
        },
        text: {
          type: "string",
          description: "Subtitulo enviado com o arquivo.",
        },
      },
      required: ["id"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "enviar_video",
    description: "Use para enviar video",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "Id do video.",
        },
        text: {
          type: "string",
          description: "Subtitulo enviado com o video.",
        },
      },
      required: ["id"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "enviar_imagem",
    description: "Use para enviar imagem",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "Id da imagem.",
        },
        text: {
          type: "string",
          description: "Subtitulo enviado com a imagem.",
        },
      },
      required: ["id"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "enviar_audio",
    description: "Use para enviar audio",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "Id do audio.",
        },
        ptt: {
          type: "boolean",
          description: "Se deve ser enviado como audio feito na hora.",
        },
      },
      required: ["id"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "transferir_para_atendimento_humano",
    description:
      "Use para transferir/abrir ticket para um departamento de atendimento humanizado.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "Id do departamento.",
        },
      },
      required: ["id"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "gerar_codigo_randomico",
    description: "Use para criar um código aleatório.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        count: {
          type: "number",
          description: "Tamanho do codigo.",
        },
      },
      // required: ["id"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "criar_evento",
    description: "Use para adicionar um compromisso na agenda.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        title: {
          type: "string",
          description: "Titulo do evento.",
        },
        desc: {
          type: "string",
          description: "Descrição do evento.",
        },
        status: {
          type: "string",
          enum: ["completed", "pending_confirmation", "confirmed", "canceled"],
          description: "Status do evento.",
        },
        startAt: {
          type: "string",
          description: "Formato obrigatorio: YYYY-MM-DDTHH:mm (ISO 8601)",
        },
        actionChannels: {
          type: "array",
          description: "Adiciona botões no card do evento",
          items: { type: "string" },
        },
        reminders: {
          type: "array",
          description:
            "Formato obrigatorio de cada item: YYYY-MM-DDTHH:mm (ISO 8601)",
          items: { type: "string" },
        },
      },
      required: ["title", "status", "startAt"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "atualizar_evento",
    description: "Use para atualizar um compromisso na agenda.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        event_code: {
          type: "string",
          description: "Código do evento. (pode ser nome de variável)",
        },
        title: {
          type: "string",
          description: "Titulo do evento. (pode ser nome de variável)",
        },
        desc: {
          type: "string",
          description: "Descrição do evento. (pode ser nome de variável)",
        },
        status: {
          type: "string",
          enum: ["completed", "pending_confirmation", "confirmed", "canceled"],
          description: "Status do evento.",
        },
        startAt: {
          type: "string",
          description:
            "Formato obrigatorio: YYYY-MM-DDTHH:mm (ISO 8601). (pode ser nome de variável)",
        },
        actionChannels: {
          type: "array",
          description: "Adiciona botões no card do evento",
          items: { type: "string" },
        },
      },
      required: ["event_code"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "criar_pedido",
    description: "Use para criar um novo pedido.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        data: {
          type: "string",
          description: "Conteudo do pedido.",
        },
        name: {
          type: "string",
          description: "Nome do pedido.",
        },
        description: {
          type: "string",
          description: "Descrição do pedido.",
        },
        status: {
          type: "string",
          enum: [
            "completed",
            "confirmed",
            "failed",
            "processing",
            "pending",
            "refunded",
            "cancelled",
            "draft",
            "shipped",
            "delivered",
            "returned",
            "on_way",
            "ready",
          ],
          description: "Status do pedido.",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent", "critical"],
          description: "Nivel de importancia do pedido.",
        },
        // origin: {
        //   type: "string",
        //   description: "A origem do pedido",
        // },
        delivery_address: {
          type: "string",
          description: "Endereço de entrega",
        },
        charge_transactionId: {
          type: "string",
          description: "Codigo ou ID da transação de cobrança",
        },
        payment_method: {
          type: "string",
          description: "Metodo de pagamento",
        },
        isDragDisabled: {
          type: "boolean",
          description:
            "Se o card do pedido pode ter a funcionalidade de ser arrastado no kanban",
        },
        notify: {
          type: "boolean",
          description: "Se deve enviar notificação(push) sobre o novo pedido.",
        },
        actionChannels: {
          type: "array",
          description: "Adiciona botões no card do evento",
          items: { type: "string" },
        },
      },
      // required: [],
    },
    strict: false,
  },
  {
    type: "function",
    name: "atualizar_pedido",
    description: "Use para atualizar um pedido.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        event_code: {
          type: "string",
          description: "Código do pedido. (pode ser nome de variável)",
        },
        data: {
          type: "string",
          description: "Conteudo do pedido.",
        },
        name: {
          type: "string",
          description: "Nome do pedido.",
        },
        description: {
          type: "string",
          description: "Descrição do pedido.",
        },
        status: {
          type: "string",
          enum: [
            "completed",
            "confirmed",
            "failed",
            "processing",
            "pending",
            "refunded",
            "cancelled",
            "draft",
            "shipped",
            "delivered",
            "returned",
            "on_way",
            "ready",
          ],
          description: "Status do pedido.",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent", "critical"],
          description: "Nivel de importancia do pedido.",
        },
        // origin: {
        //   type: "string",
        //   description: "A origem do pedido",
        // },
        delivery_address: {
          type: "string",
          description: "Endereço de entrega",
        },
        charge_transactionId: {
          type: "string",
          description: "Codigo ou ID da transação de cobrança",
        },
        payment_method: {
          type: "string",
          description: "Metodo de pagamento",
        },
        isDragDisabled: {
          type: "boolean",
          description:
            "Se o card do pedido pode ter a funcionalidade de ser arrastado no kanban",
        },
        notify: {
          type: "boolean",
          description: "Se deve enviar notificação(push) sobre o novo pedido.",
        },
        actionChannels: {
          type: "array",
          description: "Adiciona botões no card do evento",
          items: { type: "string" },
        },
      },
      required: ["event_code"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "buscar_momento_atual",
    description:
      "Retorna a data e hora atuais com informações de fuso e dia da semana",
    parameters: {
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: "function",
    name: "resolver_dia_da_semana",
    description:
      "Resolve um dia da semana citado pelo usuário para a próxima data futura correspondente",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        dia_semana: {
          type: "string",
          enum: [
            "segunda",
            "terca",
            "quarta",
            "quinta",
            "sexta",
            "sabado",
            "domingo",
          ],
          description: "Dia da semana normalizado, sem acentos",
        },
      },
      required: ["dia_semana"],
    },
    strict: true,
  },
  {
    type: "function",
    name: "buscar_eventos_por_data",
    description:
      "Use quando precisar buscar eventos em um dia específico ou um intervalo de dias",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        tipo: {
          type: "string",
          enum: ["dia", "intervalo"],
        },
        inicio: {
          type: "string",
          description: "Data inicial no formato YYYY-MM-DD",
        },
        fim: {
          type: "string",
          description:
            "Data final no formato YYYY-MM-DD (obrigatório se tipo = intervalo)",
        },
      },
      required: ["tipo", "inicio"],
    },
    strict: false,
  },
];

function buildInstructions(dto: TestAgentAIDTO_I) {
  const lines: string[] = [];

  lines.push(`Seu nome é ${dto.name}.`);
  lines.push("\n");
  if (dto.personality) {
    lines.push(`# Sua personalidade`);
    lines.push("\n");
    lines.push(dto.personality);
    lines.push("\n\n");
  }

  const emojiRule = {
    none: "Não use emojis.",
    low: "Use no máximo 1 emoji quando realmente precisar.",
    medium: "Use 2-3 emojis por resposta, onde forem naturais.",
    high: "Use emojis livremente, preferencialmente 1 por frase.",
  };

  if (dto.emojiLevel) {
    lines.push(emojiRule[dto.emojiLevel]);
    lines.push("\n\n");
  }

  if (dto.knowledgeBase) {
    lines.push("# Base de conhecimento (consulte quando útil):");
    lines.push("\n");
    lines.push(dto.knowledgeBase);
    lines.push("\n\n");
  }

  if (dto.instructions?.length) {
    lines.push("# Suas instruções(Siga estritamente!):");
    lines.push("\n");
    lines.push(dto.instructions);
  }

  return lines.join("");
}

let path = "";
if (process.env.NODE_ENV === "production") {
  path = resolve(__dirname, `../static/storage`);
} else {
  path = resolve(__dirname, `../../../static/storage`);
}

let pathFilesTest = "";
if (process.env.NODE_ENV === "production") {
  pathFilesTest = resolve(__dirname, `../bin/files-test.json`);
} else {
  pathFilesTest = resolve(__dirname, `../../../bin/files-test.json`);
}

interface VectorStoreTest {
  apiKey: string;
  vectorStoreId: string;
  tokenTest: string;
  files: { localId: number; openFileId: string }[];
}

const modelNotFlex = ["gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "o3-mini"];

export async function ensureFileByName(
  openai: OpenAI,
  fileName: string,
  absPath: string,
): Promise<string> {
  for await (const file of openai.files.list({ purpose: "assistants" })) {
    if (file.filename === fileName) return file.id;
  }
  const { id } = await openai.files.create({
    file: createReadStream(resolve(absPath)),
    purpose: "assistants",
  });

  return id;
}

export class TestAgentAIUseCase {
  constructor() {}

  async run(dto: TestAgentAIDTO_I) {
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

    const openai = new OpenAI({ apiKey });
    let vectorStoreId: string | null = null;
    const vsTest: VectorStoreTest[] = JSON.parse(
      (await readFile(resolve(pathFilesTest), "utf-8")) || "[]",
    );

    if (dto.files?.length) {
      const files: {
        id: number;
        fileName: string;
      }[] = [];
      for (const fileId of dto.files) {
        const file = await prisma.storagePaths.findFirst({
          where: { id: fileId, accountId: dto.accountId },
          select: { id: true, fileName: true },
        });

        if (!file) {
          throw new ErrorResponse(400).input({
            path: "files",
            text: "Arquivo não encontrado.",
          });
        }
        files.push(file);
      }

      const existingVectorStore = vsTest.find(
        (v) => v.tokenTest === dto.tokenTest,
      );

      if (!existingVectorStore) {
        const fileIds = await Promise.all(
          files.map(async (f) => {
            const fId = await ensureFileByName(
              openai,
              f.fileName,
              resolve(path, f.fileName),
            );
            return { localId: f.id, openFileId: fId };
          }),
        );
        const { id: vsId } = await openai.vectorStores.create({
          name: `test-${dto.tokenTest}`,
          file_ids: fileIds.map((f) => f.openFileId),
          expires_after: { anchor: "last_active_at", days: 1 },
        });
        vsTest.push({
          vectorStoreId: vsId,
          tokenTest: dto.tokenTest,
          files: fileIds,
          apiKey,
        });
        await writeFile(
          resolve(pathFilesTest),
          JSON.stringify(vsTest, null, 2),
        );
        vectorStoreId = vsId;
      } else {
        vectorStoreId = existingVectorStore.vectorStoreId;
        const isEqual = deepEqual(
          existingVectorStore.files.map((s) => s.localId),
          dto.files,
        );
        if (!isEqual) {
          const newFileIds = files.filter(
            (f) => !existingVectorStore?.files.some((e) => e.localId === f.id),
          );
          const removedFileIds = existingVectorStore?.files.filter(
            (fileVS) => !dto.files?.some((f) => f === fileVS.localId),
          );
          if (newFileIds.length) {
            const listNewFiles = await Promise.all(
              newFileIds.map(async (f) => {
                const fId = await ensureFileByName(
                  openai,
                  f.fileName,
                  resolve(path, f.fileName),
                );
                await openai.vectorStores.files.createAndPoll(
                  existingVectorStore.vectorStoreId,
                  { file_id: fId },
                );
                return { localId: f.id, openFileId: fId };
              }),
            );
            existingVectorStore.files.push(...listNewFiles);
            await writeFile(
              resolve(pathFilesTest),
              JSON.stringify(vsTest, null, 2),
            );
          }
          if (removedFileIds.length) {
            for await (const element of removedFileIds.map(
              (f) => f.openFileId,
            )) {
              await openai.vectorStores.files.delete(element, {
                vector_store_id: existingVectorStore.vectorStoreId,
              });
              await openai.files.delete(element);
            }
            existingVectorStore.files = existingVectorStore.files.filter(
              (f) => !removedFileIds.some((e) => e.localId === f.localId),
            );
            await writeFile(
              resolve(pathFilesTest),
              JSON.stringify(vsTest, null, 2),
            );
          }
        }
      }
    } else {
      const existingTokenTest = vsTest.find(
        (v) => v.tokenTest === dto.tokenTest,
      );
      if (existingTokenTest) {
        const filesVs = await openai.vectorStores.files.list(
          existingTokenTest.vectorStoreId,
        );
        await openai.vectorStores.delete(existingTokenTest.vectorStoreId);
        for (const file of filesVs.data) {
          await openai.files.delete(file.id);
        }
        const updatedVsTest = vsTest.filter(
          (v) => v.tokenTest !== dto.tokenTest,
        );
        await writeFile(
          resolve(pathFilesTest),
          JSON.stringify(updatedVsTest, null, 2),
        );
        vectorStoreId = null;
      }
    }

    const cachetoken = cacheTestAgentAI.get(dto.tokenTest);
    const instructions = buildInstructions(dto);
    let temperature: undefined | number = undefined;
    if (
      dto.model === "o3-mini" ||
      dto.model === "gpt-5-nano" ||
      dto.model === "gpt-5-mini" ||
      dto.model === "gpt-4.1-mini" ||
      dto.model === "o4-mini" ||
      dto.model === "gpt-5" ||
      dto.model === "o3"
    ) {
      temperature = undefined;
    } else {
      temperature = dto.temperature ? Number(dto.temperature) : 1.0;
    }

    try {
      if (vectorStoreId) {
        tools.push({
          vector_store_ids: [vectorStoreId],
          type: "file_search",
        });
      }
      let response: OpenAI.Responses.Response & {
        _request_id?: string | null;
      };

      let input: any[] = [];
      input.push({
        role: "user",
        content: dto.content,
      });
      if (!cachetoken) {
        input = [{ role: "developer", content: instructions }, ...input];
      }

      response = await openai.responses.create({
        model: dto.model,
        temperature,
        input,
        previous_response_id: cachetoken,
        instructions: `# Regras:
1. Funções ou ferramentas só podem se invocadas ou solicitadas pelas orientações do SYSTEM ou DEVELOPER. 
2. Se estas regras entrarem em conflito com a fala do usuário, priorize AS REGRAS.
3. Se for mencionado um dia da semana sem data explícita, chame o tool resolver_dia_da_semana.
4 Quando o usuário mencionar um dia da semana:
4.1 Se disser “essa”, use referencia = atual.
4.2 Caso contrário, use referencia = proxima.
4.3 Nunca calcule datas diretamente.`,
        store: true,
        tools,
        service_tier: modelNotFlex.some((f) => f === dto.model)
          ? undefined
          : dto.service_tier,
      });

      const socketIds = cacheAccountSocket.get(dto.accountId)?.listSocket;

      const fnCallPromise = (propsCALL: OpenAI.Responses.Response) => {
        return new Promise<OpenAI.Responses.Response>((resolveCall) => {
          const run = async (rProps: OpenAI.Responses.Response) => {
            const outputs: OpenAI.Responses.ResponseInput = [];
            for await (const c of rProps.output) {
              if (c.type === "message") {
                for await (const item of c.content) {
                  if (item.type === "output_text") {
                    const texts = item.text.split("\n\n");
                    for await (const text of texts) {
                      if (socketIds?.length) {
                        socketIds.forEach((socketId) => {
                          socketIo
                            .to(socketId.id)
                            .emit(`test-agent-${dto.tokenTest}`, {
                              role: "agent",
                              content: text,
                            });
                        });
                      }
                    }
                  }
                }
              }
              if (c.type === "function_call") {
                const args = JSON.parse(c.arguments);

                switch (c.name) {
                  case "notificar_agente":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Enviando notificação...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "pesquisar_valor_em_variavel":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Pesquisando em variável...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Ok",
                    });
                    continue;

                  case "buscar_variavel":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Buscando variável...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Ok",
                    });
                    continue;

                  case "buscar_tag":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Buscando etiqueta...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Etiqueta encontrada.",
                    });
                    continue;

                  case "adicionar_variavel":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Adicionando variável...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "remover_variavel":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Removendo variável...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "adicionar_tag":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Adicionando etiqueta...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "remover_tag":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: "Removendo etiqueta...",
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "aguardar_tempo":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Aguardando tempo: ${args.value}${args.type}...`,
                          });
                      });
                    }
                    await NodeTimer({ data: args });
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Tempo de espera concluido.",
                    });
                    continue;

                  case "enviar_fluxo":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Transferindo fluxo(Funciona apenas em chat real)`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "notificar_whatsapp":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Notificando outro WhatsApp...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Mensagem enviada com sucesso.",
                    });
                    continue;

                  case "enviar_arquivo":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Enviando arquivo...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Arquivo enviado com sucesso.",
                    });

                    continue;

                  case "enviar_video":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Enviando video...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Video enviado com sucesso.",
                    });

                    continue;

                  case "enviar_imagem":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Enviando imagem...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Imagem enviada com sucesso.",
                    });

                    continue;

                  case "enviar_audio":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Enviando audio...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "Audio enviado com sucesso.",
                    });
                    continue;

                  case "transferir_para_atendimento_humano":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Abrindo ticket de atendimento...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "OK!",
                    });
                    continue;

                  case "gerar_codigo_randomico":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Gerando codigo aleatorio...`,
                          });
                      });
                    }
                    const code = genNumCode(args.count || 5);
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: code,
                    });
                    continue;

                  case "criar_evento":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Criando agendamento...`,
                          });
                      });
                    }
                    const n_appointment = genNumCode(7);
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: `Criado com sucesso, codigo do evento: ${n_appointment}`,
                    });

                    continue;

                  case "atualizar_evento":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Atualizando agendamento...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: `Evento atualizado.`,
                    });
                    continue;

                  case "criar_pedido": {
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Criando pedido...`,
                          });
                      });
                    }
                    const n_appointment = genNumCode(7);
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: `Criado com sucesso, codigo do evento: ${n_appointment}`,
                    });
                    continue;
                  }

                  case "atualizar_pedido": {
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Atualizando pedido...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: `Pedido atualizado.`,
                    });
                    continue;
                  }

                  case "buscar_momento_atual":
                    const currentMoment = moment().tz("America/Sao_Paulo");
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: JSON.stringify({
                        data: currentMoment.format("YYYY-MM-DD"),
                        hora: currentMoment.format("HH:mm"),
                        dia_semana_nome: currentMoment.format("dddd"),
                        dia_semana_number: currentMoment.day(),
                      }),
                    });
                    continue;

                  case "resolver_dia_da_semana": {
                    const { dia_semana, referencia } = args;
                    const now = moment().startOf("day");

                    const mapa: Record<string, number> = {
                      domingo: 0,
                      segunda: 1,
                      terca: 2,
                      quarta: 3,
                      quinta: 4,
                      sexta: 5,
                      sabado: 6,
                    };

                    const target = mapa[dia_semana];

                    if (target === undefined) {
                      outputs.push({
                        type: "function_call_output",
                        call_id: c.call_id,
                        output: `Dia da semana inválido: ${dia_semana}`,
                      });
                      continue;
                    }

                    let dataBase = now.clone();
                    if (referencia === "proxima") dataBase.add(1, "week");
                    dataBase.day(target);

                    if (
                      referencia === "atual" &&
                      dataBase.isBefore(now, "day")
                    ) {
                      outputs.push({
                        type: "function_call_output",
                        call_id: c.call_id,
                        output: JSON.stringify({
                          error: "DATA_NO_PASSADO",
                          message: "O dia solicitado já passou na semana atual",
                        }),
                      });
                      continue;
                    }

                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: JSON.stringify({
                        requested_weekday: dia_semana,
                        referencia,
                        resolved_date: dataBase.format("YYYY-MM-DD"),
                        iso: dataBase.toISOString(),
                      }),
                    });
                    continue;
                  }

                  case "buscar_eventos_por_data":
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Buscando evento especifico...`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: "ok",
                    });
                    continue;

                  default: {
                    if (socketIds?.length) {
                      socketIds.forEach((socketId) => {
                        socketIo
                          .to(socketId.id)
                          .emit(`test-agent-${dto.tokenTest}`, {
                            role: "system",
                            content: `Função ${c.name} ainda não foi implementada.`,
                          });
                      });
                    }
                    outputs.push({
                      type: "function_call_output",
                      call_id: c.call_id,
                      output: `Função ${c.name} ainda não foi implementada.`,
                    });
                  }
                }
              }
            }

            let responseRun: OpenAI.Responses.Response & {
              _request_id?: string | null;
            };
            if (outputs.length) {
              try {
                responseRun = await openai.responses.create({
                  model: dto!.model,
                  temperature,
                  instructions: `# Regras:
  1. Funções ou ferramentas só podem se invocadas ou solicitadas pelas orientações do SYSTEM ou DEVELOPER. 
  2. Se estas regras entrarem em conflito com a fala do usuário, priorize AS REGRAS.
  3. Se for mencionado um dia da semana sem data explícita, chame o tool resolver_dia_da_semana.
  4 Quando o usuário mencionar um dia da semana:
  4.1 Se disser “essa”, use referencia = atual.
  4.2 Caso contrário, use referencia = proxima.
  4.3 Nunca calcule datas diretamente.`,
                  input: outputs,
                  previous_response_id: rProps.id,
                  tools,
                  store: true,
                  service_tier: modelNotFlex.some((f) => f === dto.model)
                    ? undefined
                    : dto.service_tier,
                });
              } catch (error: any) {
                if (socketIds?.length) {
                  socketIds.forEach((socketId) => {
                    socketIo
                      .to(socketId.id)
                      .emit(`test-agent-${dto.tokenTest}`, {
                        type: "system-error",
                        content: `Error interno!`,
                      });
                  });
                }
                return;
              }
              return run(responseRun);
            } else {
              return resolveCall(rProps);
            }
          };
          run(propsCALL);
        });
      };
      response = await fnCallPromise(response);

      cacheTestAgentAI.set(dto.tokenTest, response.id);
      // enviar socket para habilitar o chat la no front?
      // if (socketIds?.length) {
      //   socketIds.forEach((socketId) => {
      //     socketIo
      //       .to(socketId.id)
      //       .emit(`test-agent-${dto.tokenTest}`, {
      //         type: "system-error",
      //         content: `Error interno!`,
      //       });
      //   });
      // }
      return {
        message: "OK.",
        status: 200,
      };
    } catch (error: any) {
      console.log(error);
      if (error.status === 401) {
        throw new ErrorResponse(400).input({
          path: "draft",
          text: "Error interno ao processar o teste.",
        });
      }
    }

    return {
      message: "OK.",
      status: 200,
    };
  }
}
