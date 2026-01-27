import {
  cacheAgentsSentPromptInstruction,
  cacheDebouceAgentAIRun,
  cacheDebounceAgentAI,
  cacheInfoAgentAI,
  cacheMessagesDebouceAgentAI,
  cacheNewMessageWhileDebouceAgentAIRun,
  cacheNextInputsCurrentAgents,
  scheduleTimeoutAgentAI,
} from "../../../adapters/Baileys/Cache";
import { NodeAgentAIData } from "../Payload";
import moment from "moment-timezone";
import { scheduleJob } from "node-schedule";
import { prisma } from "../../../adapters/Prisma/client";
import OpenAI from "openai";
// import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { TypingDelay } from "../../../adapters/Baileys/modules/typing";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { searchLinesInText } from "../../../utils/searchLinesInText";
import { mongo } from "../../../adapters/mongo/connection";
import { ModelFlows } from "../../../adapters/mongo/models/flows";
import { NodeTimer } from "./Timer";
import { NodeNotifyWA } from "./NotifyWA";
import { sessionsBaileysWA } from "../../../adapters/Baileys";
import { NodeSendFiles } from "./SendFiles";
import { NodeSendVideos } from "./SendVideos";
import { NodeSendImages } from "./SendImages";
import { NodeSendAudios } from "./SendAudios";
import { NodeSendAudiosLive } from "./SendAudiosLive";
import { NodeTransferDepartment } from "./TransferDepartment";
import { genNumCode } from "../../../utils/genNumCode";
import { NodeCreateAppointment } from "./CreateAppointment";
import { nanoid } from "nanoid";
import { NodeUpdateAppointment } from "./UpdateAppointment";
import { NodeCreateOrder } from "./CreateOrder";
import { NodeUpdateOrder } from "./UpdateOrder";
import { NodeCharge } from "./Charge";

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
          description: "Subtítulo enviado com o arquivo.",
        },
      },
      required: ["id"],
    },
    strict: false,
  },
  {
    type: "function",
    name: "enviar_video",
    description: "Use para enviar vídeo",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        id: {
          type: "number",
          description: "Id do vídeo.",
        },
        text: {
          type: "string",
          description: "Subtítulo enviado com o vídeo.",
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
          description: "Subtítulo enviado com a imagem.",
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
          description: "Título do evento.",
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
          description: "Título do evento. (pode ser nome de variável)",
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
  {
    type: "function",
    name: "criar_cobranca",
    description: "Use para criar uma cobrança Pix.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        paymentIntegrationId: {
          type: "number",
          description: "ID da integração de pagamento.",
        },
        total: {
          type: "number",
          description: "Valor da cobrança.",
        },
        content: {
          type: "string",
          description: "Descrição da cobrança. (opcional)",
        },
        varId_email: {
          type: "number",
          description: "ID da variável que tem o email do usuário (opcional)",
        },
        varId_save_transactionId: {
          type: "number",
          description:
            "ID da variável que salvará o Codigo/ID da transação (opcional)",
        },
        varId_save_qrCode: {
          type: "number",
          description:
            "ID da variável que salvará o QR Code para o pagamento (opcional)",
        },
        varId_save_linkPayment: {
          type: "number",
          description:
            "ID da variável que salvará o Link de pagamento (opcional)",
        },
      },
      // required: [],
    },
    strict: false,
  },
];

type ResultDebounceAgentAI =
  | { run: "exit" }
  | { run: "enviar_fluxo" }
  | undefined;

function buildInstructions(dto: {
  name: string;
  emojiLevel?: "none" | "low" | "medium" | "high";
  personality?: string;
  knowledgeBase?: string;
  instructions?: string;
}) {
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

const getNextTimeOut = (
  type: "minutes" | "hours" | "days" | "seconds",
  value: number,
) => {
  try {
    if (type === "seconds" && value > 1440) value = 1440;
    if (type === "minutes" && value > 10080) value = 10080;
    if (type === "hours" && value > 168) value = 168;
    if (type === "days" && value > 7) value = 7;
    const nowDate = moment().tz("America/Sao_Paulo");
    return new Date(nowDate.add(value, type).toString());
  } catch (error) {
    console.error("Error in getNextTimeOut:", error);
    throw new Error("Failed to calculate next timeout");
  }
};

interface PropsNodeAgentAI {
  numberLead: string;
  numberConnection: string;
  data: NodeAgentAIData;
  message?: { value: string; isDev: boolean };
  flowId: string;
  accountId: number;
  nodeId: string;
  previous_response_id?: string;
  flowStateId: number;
  businessName: string;
  connectionWhatsId: number;
  contactAccountId: number;
  actions: {
    onErrorClient?(): void;
    onExecuteTimeout?: (pre_res_id: string) => Promise<void>;
    onExitNode?(name: string, previous_response_id?: string | null): void;
    onSendFlow?(flowIs: string, previous_response_id?: string | null): void;
    onTransferDepartment?(previous_response_id?: string | null): void;
  };
}

type ResultPromise =
  | { action: "return" }
  | { action: "failed" }
  | { action: "failAttempt" }
  | { action: "sucess"; sourceHandle: string };

async function getAgent(id: number, accountId: number) {
  let agentAIf = cacheInfoAgentAI.get(id);
  if (!agentAIf) {
    const agent = await prisma.agentAI.findFirst({
      where: {
        id: id,
        Account: {
          // isPremium: true,
          id: accountId,
        },
      },
      select: {
        timeout: true,
        model: true,
        temperature: true,
        name: true,
        personality: true,
        knowledgeBase: true,
        instructions: true,
        emojiLevel: true,
        ProviderCredential: { select: { apiKey: true } },
        vectorStoreId: true,
        debounce: true,
        service_tier: true,
      },
    });
    if (!agent) throw new Error("AgentAI not found");
    const { ProviderCredential, ...rest } = agent;
    agentAIf = { ...rest, apiKey: ProviderCredential.apiKey };
  }
  return agentAIf;
}

function buildInput(nodeInstruction?: string, userContent?: string) {
  const arr: { role: "developer" | "user"; content: string }[] = [];
  if (nodeInstruction)
    arr.push({
      role: "developer",
      content: `# Instrução direta
${nodeInstruction}`,
    });
  if (userContent) arr.push({ role: "user", content: userContent });
  return arr[0];
}

function CalculeTypingDelay(text: string, ms = 150) {
  const delay = text.split(" ").length * (ms / 1000);
  return delay < 1.9 ? 1.9 : delay;
}

export const NodeAgentAI = async ({
  message = { isDev: false, value: "" },
  ...props
}: PropsNodeAgentAI): Promise<ResultPromise> => {
  // if (!message && !!props.data.exist) {
  //   // alimentar a instrução e sair imediatamente.
  //   const agent = await getAgent(props.data.agentId, props.accountId);
  //   const openai = new OpenAI({ apiKey: agent.apiKey });
  // }

  const keyMap =
    props.numberConnection + props.numberLead + String(props.data.agentId);

  function createTimeoutJob(timeout: number, pre_res_id: string) {
    if (!timeout) {
      props.actions?.onExecuteTimeout?.(pre_res_id);
      return;
    }

    /// o adm solicita que execute o tools "..." valor: "..."
    const nextTimeout = getNextTimeOut("seconds", timeout);
    const timeoutJob = scheduleJob(nextTimeout, async () =>
      props.actions?.onExecuteTimeout?.(pre_res_id),
    );
    scheduleTimeoutAgentAI.set(keyMap, timeoutJob);
  }

  const scTimeout = scheduleTimeoutAgentAI.get(keyMap);
  scTimeout?.cancel();
  scheduleTimeoutAgentAI.delete(keyMap);

  // function deleteDebounceAndTimeout() {
  //   const debounce = cacheDebounceAgentAI.get(keyMap);
  //   const scTimeout = scheduleTimeoutAgentAI.get(keyMap);
  //   debounce?.cancel();
  //   scTimeout?.cancel();
  //   scheduleTimeoutAgentAI.delete(keyMap);
  //   cacheDebounceAgentAI.delete(keyMap);
  // }

  const agent = await getAgent(props.data.agentId, props.accountId);

  // if (!message) {
  //   const getTimeoutJob = scheduleTimeoutAgentAI.get(keyMap);
  //   if (!getTimeoutJob)  createTimeoutJob(agent.timeout);
  // }

  // lista de mensagens recebidas enquanto estava esperando o debounce acabar

  const messages = cacheMessagesDebouceAgentAI.get(keyMap) || [];
  const nextMessages = [...messages, message];
  cacheMessagesDebouceAgentAI.set(keyMap, nextMessages);

  // verifica se já existe um debounce sendo executado.
  // e muda o cache para TREU caso já esteja sendo executado.

  // fiz essa variavel para caso nao receba mensagem e é pra executar imediatamente quando nao receber mensagem
  // let executeNow = false;

  const isRunDebounce = cacheDebouceAgentAIRun.get(keyMap) || false;
  // console.log({ message: nextMessages });
  if (!!isRunDebounce) {
    cacheNewMessageWhileDebouceAgentAIRun.set(keyMap, true);
    return { action: "return" };
  } else {
    if (!message) {
      // nao ta sendo executado e e não veio mensagem.
      // pode significar 2 coisas:
      //      o ADM inicio um bate papo normal.  (até então só faz isso aqui) <<<<
      //      o ADM pre processar algum dado.
      // console.log(
      //   "=== debounce deve ser executado imediatamente, e o timeout cancelado e limpo"
      // );
      // executeNow = true;
    } else {
      // debounce nao ta sendo executado e tem nova mensagem.
      // cancela o debounce para ser criado um novo.
      const debounce = cacheDebounceAgentAI.get(keyMap);
      debounce?.cancel();
    }
    // se nao veio mensagem o debounce deve ser executado imediatamente e o timeout cancelado e limpo;
    // se veio mensagem o debouce deve ser resetado e o timeout cancelado.
    // deleteDebounceAndTimeout();
  }

  // if (isExecNow) {
  //   console.log("DEBOUNCE EXECUTANDO AGORA...");
  // }

  // cria um novo debounce
  async function execute() {
    console.log("ABRIU O DEBOUNCE");
    cacheDebouceAgentAIRun.set(keyMap, true);
    async function runDebounceAgentAI(): Promise<ResultDebounceAgentAI> {
      return new Promise<ResultDebounceAgentAI>(async (resolve, reject) => {
        cacheNewMessageWhileDebouceAgentAIRun.set(keyMap, false);

        const agent = await getAgent(props.data.agentId, props.accountId);
        const openai = new OpenAI({ apiKey: agent.apiKey });

        const property0 = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          numberLead: props.numberLead,
          text: props.data.prompt || "",
        });
        const property = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          numberLead: props.numberLead,
          text: property0 || "",
        });
        const knowledgeBase = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          numberLead: props.numberLead,
          text: agent.knowledgeBase || "",
        });
        const instructions1 = await resolveTextVariables({
          accountId: props.accountId,
          contactsWAOnAccountId: props.contactAccountId,
          numberLead: props.numberLead,
          text: agent.instructions || "",
        });
        const instructions = buildInstructions({
          name: agent.name,
          emojiLevel: agent.emojiLevel,
          personality: agent.personality || undefined,
          knowledgeBase: knowledgeBase,
          instructions: instructions1,
        });

        if (agent.vectorStoreId) {
          tools.push({
            vector_store_ids: [agent.vectorStoreId],
            type: "file_search",
          });
        }
        const listMsg = cacheMessagesDebouceAgentAI.get(keyMap) || [];
        await new Promise(async (resExecute) => {
          async function executeProcess(
            msgs: { isDev: boolean; value: string }[],
            previous_response?: string,
          ) {
            console.log({ entrada: msgs });
            cacheNewMessageWhileDebouceAgentAIRun.delete(keyMap);
            cacheMessagesDebouceAgentAI.delete(keyMap);
            const sentPrompt = cacheAgentsSentPromptInstruction.get(keyMap);
            let isSentHere = false;
            let input: any[] = [];

            // pra saber se já foi enviado a instrução do agente e nao
            // enviar novamente a mesma instrução a cada mensagem.
            if (sentPrompt?.length && sentPrompt.includes(props.nodeId)) {
              for (const ms of msgs) {
                input.push({
                  role: ms.isDev ? "developer" : "user",
                  content: ms.value,
                });
              }
            } else {
              if (property) input.push(buildInput(property));
              for (const ms of msgs) {
                input.push({
                  role: ms.isDev ? "developer" : "user",
                  content: ms.value,
                });
              }
              cacheAgentsSentPromptInstruction.set(keyMap, [
                props.nodeId,
                ...(sentPrompt || []),
              ]);
              isSentHere = true;
            }
            if (!previous_response) {
              input = [{ role: "developer", content: instructions }, ...input];
            }
            // usando recuperar as notificações que o agente recebeu de outro agente.
            const nextinputs = cacheNextInputsCurrentAgents.get(
              props.flowStateId,
            );
            if (nextinputs?.length) {
              input = [
                ...nextinputs.map((content) => ({
                  role: "developer",
                  content,
                })),
                ...input,
              ];
            }

            let temperature: undefined | number = undefined;
            if (
              agent.model === "o3-mini" ||
              agent.model === "gpt-5-nano" ||
              agent.model === "gpt-5-mini" ||
              agent.model === "gpt-4.1-mini" ||
              agent.model === "o4-mini"
            ) {
              temperature = undefined;
            } else {
              temperature = agent.temperature.toNumber() || 1.0;
            }
            let response: OpenAI.Responses.Response & {
              _request_id?: string | null;
            };
            console.log(input);
            try {
              response = await openai.responses.create({
                model: agent.model,
                temperature,
                input: input.filter((s) => s),
                previous_response_id: previous_response,
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
                service_tier: agent.service_tier,
              });
            } catch (error: any) {
              console.log(error);
              // tratar aqui
              const debounceJob = cacheDebounceAgentAI.get(keyMap);
              const timeoutJob = scheduleTimeoutAgentAI.get(keyMap);
              cacheDebouceAgentAIRun.set(keyMap, false);
              debounceJob?.cancel();
              timeoutJob?.cancel();
              cacheDebounceAgentAI.delete(keyMap);
              scheduleTimeoutAgentAI.delete(keyMap);
              cacheMessagesDebouceAgentAI.delete(keyMap);
              cacheNewMessageWhileDebouceAgentAIRun.delete(keyMap);
              reject({ ...error.error, line: "1077" });
              return;
            }

            const total_tokens = structuredClone(
              response.usage?.total_tokens || 0,
            );
            const input_tokens = structuredClone(
              response.usage?.input_tokens || 0,
            );
            const output_tokens = structuredClone(
              response.usage?.output_tokens || 0,
            );

            // se tiver nova mensagem depois de receber a primeira resposta
            // então retorna do inicio com as novas mensagem também;
            // const isNewMsg = cacheNewMessageWhileDebouceAgentAIRun.get(keyMap);
            // if (!!isNewMsg) {
            //   const getNewMessages = cacheMessagesDebouceAgentAI.get(keyMap);
            //   cacheNewMessageWhileDebouceAgentAIRun.set(keyMap, false);
            //   console.log("Chamou o executeProcess 1");
            //   await new Promise((s) => setTimeout(s, 2000));
            //   return await executeProcess([...msgs, ...(getNewMessages || [])], nextresponse.id);
            // }

            // const calls = response.output.filter(
            //   (o) => o.type === "function_call"
            // );
            // console.log("=============== START ====");
            // console.log(calls);
            // console.log("=============== START ====");

            // executa ferramentas do agente recursivamente com as mensagens pendentes;
            let executeNow = null as null | {
              event:
                | "exist"
                | "enviar_fluxo"
                | "transferir_para_atendimento_humano";
              value: string | number;
            };
            // console.log({ isExit: executeNow, msgs, agenteName: agent.name });
            const fnCallPromise = (propsCALL: OpenAI.Responses.Response) => {
              return new Promise<
                OpenAI.Responses.Response & { restart?: boolean }
              >((resolveCall) => {
                const run = async (
                  rProps: OpenAI.Responses.Response & { restart?: boolean },
                ) => {
                  let restart = false;
                  const outputs: OpenAI.Responses.ResponseInput = [];
                  for await (const c of rProps.output) {
                    if (c.type === "message") {
                      const isNewMsg =
                        !!cacheNewMessageWhileDebouceAgentAIRun.get(keyMap);
                      if (isNewMsg) {
                        restart = true;
                        continue;
                      }

                      for await (const item of c.content) {
                        if (item.type === "output_text") {
                          if (executeNow) continue;

                          const texts = item.text.split("\n\n");
                          for await (const text of texts) {
                            if (!text.trim()) continue;
                            try {
                              await TypingDelay({
                                connectionId: props.connectionWhatsId,
                                toNumber: props.numberLead,
                                delay: CalculeTypingDelay(text),
                              });
                              await SendMessageText({
                                connectionId: props.connectionWhatsId,
                                text: text,
                                toNumber: props.numberLead,
                              });
                            } catch (error) {
                              const debounceJob =
                                cacheDebounceAgentAI.get(keyMap);
                              const timeoutJob =
                                scheduleTimeoutAgentAI.get(keyMap);
                              debounceJob?.cancel();
                              timeoutJob?.cancel();
                              cacheDebounceAgentAI.delete(keyMap);
                              scheduleTimeoutAgentAI.delete(keyMap);
                              cacheMessagesDebouceAgentAI.delete(keyMap);
                              props.actions.onErrorClient?.();
                              // matar aqui;
                            }
                          }
                        }
                      }
                    }
                    if (c.type === "function_call") {
                      const args = JSON.parse(c.arguments);

                      const isNewMsg =
                        !!cacheNewMessageWhileDebouceAgentAIRun.get(keyMap);
                      if (isNewMsg) {
                        restart = true;
                        outputs.push({
                          type: "function_call_output",
                          call_id: c.call_id,
                          output: "OK!",
                        });
                        continue;
                      }

                      switch (c.name) {
                        case "notificar_agente":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }

                          const getFl = await prisma.flowState.findMany({
                            where: { agentId: args.id, isFinish: false },
                            select: { id: true },
                          });

                          if (getFl.length) {
                            for (const fl of getFl) {
                              const pickNexts =
                                cacheNextInputsCurrentAgents.get(fl.id);
                              cacheNextInputsCurrentAgents.set(fl.id, [
                                ...(pickNexts || []),
                                args.text,
                              ]);
                            }
                          }

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "pesquisar_valor_em_variavel":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }

                          let pick2 = await prisma.variable.findFirst({
                            where: {
                              name: args.name,
                              accountId: props.accountId,
                            },
                            select: {
                              value: true,
                              ContactsWAOnAccountVariable: {
                                take: 1,
                                where: {
                                  contactsWAOnAccountId: props.contactAccountId,
                                },
                                select: { value: true },
                              },
                            },
                          });

                          if (
                            !pick2?.value &&
                            !pick2?.ContactsWAOnAccountVariable?.[0]?.value
                          ) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Variável "${args.name}" não existe.`,
                            });
                            continue;
                          }
                          const search = searchLinesInText(
                            pick2?.value ||
                              pick2?.ContactsWAOnAccountVariable?.[0]?.value,
                            args.query,
                          );

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: JSON.stringify(search),
                          });
                          continue;

                        case "buscar_variavel":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }

                          let pick = await prisma.variable.findFirst({
                            where: {
                              name: args.name,
                              accountId: props.accountId,
                            },
                            select: {
                              id: true,
                              value: true,
                              ContactsWAOnAccountVariable: {
                                take: 1,
                                where: {
                                  contactsWAOnAccountId: props.contactAccountId,
                                },
                                select: { value: true },
                              },
                            },
                          });

                          const valueVar =
                            pick?.value ||
                            pick?.ContactsWAOnAccountVariable?.[0]?.value;
                          let outputV = "";

                          if (!valueVar) {
                            outputV =
                              "Variável não encontrada ou não está associada ao usuário.";
                          } else {
                            outputV = `ID da variável=${pick.id}\nValor=${valueVar}`;
                          }

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: outputV,
                          });
                          continue;

                        case "buscar_tag":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }

                          let pickTag = await prisma.tag.findFirst({
                            where: {
                              name: args.name,
                              accountId: props.accountId,
                            },
                            select: {
                              TagOnContactsWAOnAccount: {
                                take: 1,
                                where: {
                                  contactsWAOnAccountId: props.contactAccountId,
                                },
                                select: { id: true },
                              },
                            },
                          });

                          if (!pickTag) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Etiqueta não encontrada.",
                            });
                          } else {
                            if (pickTag.TagOnContactsWAOnAccount.length) {
                              outputs.push({
                                type: "function_call_output",
                                call_id: c.call_id,
                                output:
                                  "Etiqueta encontrada, mas não está associada ao usuário.",
                              });
                            } else {
                              if (pickTag.TagOnContactsWAOnAccount.length) {
                                outputs.push({
                                  type: "function_call_output",
                                  call_id: c.call_id,
                                  output:
                                    "Etiqueta encontrada e está associada ao usuário.",
                                });
                              }
                            }
                          }

                          continue;

                        case "adicionar_variavel":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const nameV = (args.name as string)
                            .trim()
                            .replace(/\s/, "_");
                          let addVari = await prisma.variable.findFirst({
                            where: { name: nameV, accountId: props.accountId },
                            select: { id: true, type: true },
                          });
                          if (addVari?.type === "system") {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Variável não pode ser alterada.",
                            });
                            continue;
                          }
                          if (!addVari) {
                            addVari = await prisma.variable.create({
                              data: {
                                name: nameV,
                                accountId: props.accountId,
                                type: "dynamics",
                              },
                              select: { id: true, type: true },
                            });
                          }
                          if (addVari.type === "dynamics") {
                            const isExistVar =
                              await prisma.contactsWAOnAccountVariable.findFirst(
                                {
                                  where: {
                                    contactsWAOnAccountId:
                                      props.contactAccountId,
                                    variableId: addVari.id,
                                  },
                                  select: { id: true },
                                },
                              );
                            if (!isExistVar) {
                              await prisma.contactsWAOnAccountVariable.create({
                                data: {
                                  contactsWAOnAccountId: props.contactAccountId,
                                  variableId: addVari.id,
                                  value: args.value,
                                },
                              });
                            } else {
                              await prisma.contactsWAOnAccountVariable.update({
                                where: { id: isExistVar.id },
                                data: {
                                  contactsWAOnAccountId: props.contactAccountId,
                                  variableId: addVari.id,
                                  value: args.value,
                                },
                              });
                            }
                          } else {
                            await prisma.variable.update({
                              where: { id: addVari.id },
                              data: { value: args.value },
                            });
                          }
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "remover_variavel":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const nameV2 = (args.name as string)
                            .trim()
                            .replace(/\s/, "_");
                          const rmVar = await prisma.variable.findFirst({
                            where: { name: nameV2, accountId: props.accountId },
                            select: { id: true },
                          });
                          if (rmVar) {
                            const picked =
                              await prisma.contactsWAOnAccountVariable.findFirst(
                                {
                                  where: {
                                    contactsWAOnAccountId:
                                      props.contactAccountId,
                                    variableId: rmVar.id,
                                  },
                                  select: { id: true },
                                },
                              );
                            if (picked) {
                              await prisma.contactsWAOnAccountVariable.delete({
                                where: { id: picked.id },
                              });
                            }
                          }
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "adicionar_tag":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const nameT = (args.name as string)
                            .trim()
                            .replace(/\s/, "_");
                          let tag = await prisma.tag.findFirst({
                            where: { name: nameT, accountId: props.accountId },
                            select: { id: true },
                          });
                          if (!tag) {
                            tag = await prisma.tag.create({
                              data: {
                                name: nameT,
                                accountId: props.accountId,
                                type: "contactwa",
                              },
                              select: { id: true },
                            });
                          }
                          const isExist =
                            await prisma.tagOnContactsWAOnAccount.findFirst({
                              where: {
                                contactsWAOnAccountId: props.contactAccountId,
                                tagId: tag.id,
                              },
                            });
                          if (!isExist) {
                            await prisma.tagOnContactsWAOnAccount.create({
                              data: {
                                contactsWAOnAccountId: props.contactAccountId,
                                tagId: tag.id,
                              },
                            });
                          }
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "remover_tag":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const nameT2 = (args.name as string)
                            .trim()
                            .replace(/\s/, "_");
                          const rmTag = await prisma.tag.findFirst({
                            where: { name: nameT2, accountId: props.accountId },
                            select: { id: true },
                          });
                          if (rmTag) {
                            await prisma.tagOnContactsWAOnAccount.delete({
                              where: { id: rmTag.id },
                            });
                          }
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "sair_node":
                          executeNow = { event: "exist", value: args.name };
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "aguardar_tempo":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          await NodeTimer({ data: args, nodeId: props.nodeId });

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "Tempo de espera concluído.",
                          });
                          continue;

                        case "enviar_fluxo":
                          await mongo();
                          const flow = await ModelFlows.findOne(
                            { name: args.name },
                            { _id: 1 },
                          ).lean();
                          if (!flow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Fluxo não encontrado!",
                            });
                            continue;
                          }
                          executeNow = {
                            event: "enviar_fluxo",
                            value: flow._id,
                          };
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "notificar_whatsapp":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const botWA = sessionsBaileysWA.get(
                            props.connectionWhatsId,
                          );
                          if (botWA) {
                            await NodeNotifyWA({
                              accountId: props.accountId,
                              botWA,
                              businessName: props.businessName,
                              connectionWhatsId: props.connectionWhatsId,
                              contactsWAOnAccountId: props.contactAccountId,
                              flowStateId: props.flowStateId,
                              numberLead: props.numberLead,
                              nodeId: props.nodeId,
                              data: {
                                text: args.text,
                                numbers: [{ key: "1", number: args.phone }],
                                tagIds: [],
                              },
                            });
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Mensagem enviada com sucesso.",
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output:
                                "Error, não foi possivel notificar outro whatsapp.",
                            });
                          }
                          continue;

                        case "enviar_arquivo":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const botWA2 = sessionsBaileysWA.get(
                            props.connectionWhatsId,
                          );
                          if (botWA2) {
                            let isError = false;
                            await NodeSendFiles({
                              accountId: props.accountId,
                              action: {
                                onErrorClient: () => {
                                  isError = true;
                                },
                              },
                              connectionWAId: props.connectionWhatsId,
                              contactsWAOnAccountId: props.contactAccountId,
                              flowStateId: props.flowStateId,
                              numberLead: props.numberLead,
                              nodeId: props.nodeId,
                              data: {
                                caption: args.text,

                                files: [
                                  {
                                    id: args.id,
                                    mimetype: "",
                                    originalName: "",
                                  },
                                ],
                              },
                            });
                            if (isError) {
                              outputs.push({
                                type: "function_call_output",
                                call_id: c.call_id,
                                output: "Error, não foi possivel enviar.",
                              });
                            }
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Arquivo enviado com sucesso.",
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Error, não foi possivel enviar.",
                            });
                          }
                          continue;

                        case "enviar_video":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const botWA3 = sessionsBaileysWA.get(
                            props.connectionWhatsId,
                          );
                          if (botWA3) {
                            let isError = false;
                            await NodeSendVideos({
                              accountId: props.accountId,
                              action: {
                                onErrorClient: () => {
                                  isError = true;
                                },
                              },
                              connectionWAId: props.connectionWhatsId,
                              contactsWAOnAccountId: props.contactAccountId,
                              botWA: botWA3,
                              numberLead: props.numberLead,
                              nodeId: props.nodeId,
                              data: {
                                caption: args.text,
                                files: [{ id: args.id, originalName: "" }],
                              },
                            });
                            if (isError) {
                              outputs.push({
                                type: "function_call_output",
                                call_id: c.call_id,
                                output: "Error, não foi possivel enviar.",
                              });
                            }
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Video enviado com sucesso.",
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Error, não foi possivel enviar.",
                            });
                          }
                          continue;

                        case "enviar_imagem":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const botWA4 = sessionsBaileysWA.get(
                            props.connectionWhatsId,
                          );
                          if (botWA4) {
                            let isError = false;
                            await NodeSendImages({
                              accountId: props.accountId,
                              action: {
                                onErrorClient: () => {
                                  isError = true;
                                },
                              },
                              connectionWAId: props.connectionWhatsId,
                              contactsWAOnAccountId: props.contactAccountId,
                              botWA: botWA4,
                              numberLead: props.numberLead,
                              nodeId: props.nodeId,
                              flowStateId: props.flowStateId,
                              data: {
                                caption: args.text,
                                files: [{ id: args.id, fileName: "" }],
                              },
                            });
                            if (isError) {
                              outputs.push({
                                type: "function_call_output",
                                call_id: c.call_id,
                                output: "Error, não foi possivel enviar.",
                              });
                            }
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Imagem enviada com sucesso.",
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Error, não foi possivel enviar.",
                            });
                          }
                          continue;

                        case "enviar_audio":
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          const botWA5 = sessionsBaileysWA.get(
                            props.connectionWhatsId,
                          );
                          if (botWA5) {
                            let isError = false;
                            if (!!args.ppt) {
                              await NodeSendAudiosLive({
                                accountId: props.accountId,
                                action: {
                                  onErrorClient: () => {
                                    isError = true;
                                  },
                                },
                                connectionWAId: props.connectionWhatsId,
                                contactsWAOnAccountId: props.contactAccountId,
                                botWA: botWA5,
                                numberLead: props.numberLead,
                                nodeId: props.nodeId,
                                flowStateId: props.flowStateId,
                                data: {
                                  files: [
                                    {
                                      id: args.id,
                                      fileName: "",
                                      originalName: "",
                                    },
                                  ],
                                },
                              });
                            } else {
                              await NodeSendAudios({
                                accountId: props.accountId,
                                action: {
                                  onErrorClient: () => {
                                    isError = true;
                                  },
                                },
                                connectionWAId: props.connectionWhatsId,
                                contactsWAOnAccountId: props.contactAccountId,
                                botWA: botWA5,
                                numberLead: props.numberLead,
                                nodeId: props.nodeId,
                                flowStateId: props.flowStateId,
                                data: {
                                  files: [
                                    {
                                      id: args.id,
                                      fileName: "",
                                      originalName: "",
                                    },
                                  ],
                                },
                              });
                            }

                            if (isError) {
                              outputs.push({
                                type: "function_call_output",
                                call_id: c.call_id,
                                output: "Error, não foi possivel enviar.",
                              });
                            }
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Audio enviado com sucesso.",
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Error, não foi possivel enviar.",
                            });
                          }
                          continue;

                        case "transferir_para_atendimento_humano":
                          executeNow = {
                            event: "transferir_para_atendimento_humano",
                            value: args._id,
                          };
                          await NodeTransferDepartment({
                            accountId: props.accountId,
                            connectionWAId: props.connectionWhatsId,
                            contactsWAOnAccountId: props.contactAccountId,
                            flowStateId: props.flowStateId,
                            nodeId: props.nodeId,
                            data: { id: args._id },
                          });
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: "OK!",
                          });
                          continue;

                        case "gerar_codigo_randomico":
                          const code = genNumCode(args.count || 5);
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: code,
                          });
                          continue;

                        case "criar_evento":
                          try {
                            let codeAppointment = "";
                            const pickBusiness =
                              await prisma.business.findFirst({
                                where: {
                                  name: props.businessName,
                                  accountId: props.accountId,
                                },
                                select: { id: true },
                              });
                            if (!pickBusiness) {
                              outputs.push({
                                type: "function_call_output",
                                call_id: c.call_id,
                                output: `Não foi possivel criar evento. Projeto(${props.businessName}) não encontrado. Error interno!`,
                              });
                              continue;
                            }
                            await NodeCreateAppointment({
                              accountId: props.accountId,
                              connectionWhatsId: props.connectionWhatsId,
                              flowId: props.flowId,
                              numberLead: props.numberLead,
                              actions: {
                                onCodeAppointment(code) {
                                  codeAppointment = code;
                                },
                              },
                              data: {
                                ...args,
                                ...(args.actionChannels?.length && {
                                  actionChannels: args.actionChannels.map(
                                    (text: string) => ({ text, key: nanoid() }),
                                  ),
                                }),
                                businessId: pickBusiness.id,
                              },
                              contactsWAOnAccountId: props.contactAccountId,
                              flowStateId: props.flowStateId,
                              nodeId: props.nodeId,
                              businessName: props.businessName,
                            });

                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Criado com sucesso, codigo do evento: ${codeAppointment}`,
                            });
                          } catch (error) {
                            console.log(error);
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Error interno ao tentar criar agendamento.`,
                            });
                          }
                          continue;

                        case "atualizar_evento":
                          const pickBusiness2 = await prisma.business.findFirst(
                            {
                              where: {
                                name: props.businessName,
                                accountId: props.accountId,
                              },
                              select: { id: true },
                            },
                          );
                          if (!pickBusiness2) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Não foi possivel criar evento. Projeto(${props.businessName}) não encontrado. Error interno!`,
                            });
                            continue;
                          }

                          const { event_code, ...rest } = args;
                          const keys = Object.keys(rest);

                          await NodeUpdateAppointment({
                            accountId: props.accountId,
                            isIA: true,
                            numberLead: props.numberLead,
                            data: {
                              ...rest,
                              fields: keys,
                              n_appointment: event_code,
                              ...(args.actionChannels?.length && {
                                actionChannels: args.actionChannels.map(
                                  (text: string) => ({ text, key: nanoid() }),
                                ),
                              }),
                            },
                            contactsWAOnAccountId: props.contactAccountId,
                            nodeId: props.nodeId,
                          });

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: `Evento atualizado.`,
                          });
                          continue;

                        case "criar_pedido":
                          let codeOrder = "";
                          const pickBusiness3 = await prisma.business.findFirst(
                            {
                              where: {
                                name: props.businessName,
                                accountId: props.accountId,
                              },
                              select: { id: true },
                            },
                          );
                          if (!pickBusiness3) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Não foi possivel criar o pedido. Projeto(${props.businessName}) não encontrado. Error interno!`,
                            });
                            continue;
                          }
                          await NodeCreateOrder({
                            accountId: props.accountId,
                            connectionWhatsId: props.connectionWhatsId,
                            flowId: props.flowId,
                            numberLead: props.numberLead,
                            actions: {
                              onCodeAppointment(code) {
                                codeOrder = code;
                              },
                            },
                            data: {
                              ...args,
                              ...(args.actionChannels?.length && {
                                actionChannels: args.actionChannels.map(
                                  (text: string) => ({ text, key: nanoid() }),
                                ),
                              }),
                              businessId: pickBusiness3.id,
                            },
                            contactsWAOnAccountId: props.contactAccountId,
                            flowStateId: props.flowStateId,
                            nodeId: props.nodeId,
                            businessName: props.businessName,
                          });

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: `Criado com sucesso, codigo do evento: ${codeOrder}`,
                          });
                          continue;

                        case "atualizar_pedido":
                          const { event_code: event_code2, ...rest2 } = args;
                          const keys2 = Object.keys(rest2);

                          await NodeUpdateOrder({
                            accountId: props.accountId,
                            numberLead: props.numberLead,
                            businessName: props.businessName,
                            flowStateId: props.flowStateId,
                            data: {
                              ...rest,
                              fields: keys2,
                              nOrder: event_code,
                              ...(args.actionChannels?.length && {
                                actionChannels: args.actionChannels.map(
                                  (text: string) => ({ text, key: nanoid() }),
                                ),
                              }),
                            },
                            contactsWAOnAccountId: props.contactAccountId,
                            nodeId: props.nodeId,
                          });

                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: `Pedido atualizado.`,
                          });
                          continue;

                        case "buscar_momento_atual":
                          const currentMoment =
                            moment().tz("America/Sao_Paulo");

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

                        case "resolver_dia_da_semana":
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
                                message:
                                  "O dia solicitado já passou na semana atual",
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

                        case "buscar_eventos_por_data":
                          const { inicio, tipo, fim } = args;
                          let start = null;
                          let end = null;

                          if (tipo === "dia") {
                            start = moment(inicio)
                              .tz("America/Sao_Paulo")
                              .add(3, "hour")
                              .startOf("day");
                            end = start.clone().add(1, "day");
                          } else {
                            start = moment(inicio)
                              .tz("America/Sao_Paulo")
                              .add(3, "hour")
                              .startOf("day");
                            end = moment(fim)
                              .tz("America/Sao_Paulo")
                              .add(3, "hour")
                              .add(1, "day")
                              .startOf("day");
                          }

                          const events = await prisma.appointments.findMany({
                            where: {
                              startAt: {
                                gte: start.toDate(),
                                lt: end.toDate(),
                              },
                            },
                            select: { startAt: true, status: true },
                          });

                          if (!events.length) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "Não há agendamentos",
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: JSON.stringify(
                                events.map((e) =>
                                  moment(e.startAt)
                                    .subtract(3, "hour")
                                    .format("YYYY-MM-DDTHH:mm"),
                                ),
                              ),
                            });
                          }
                          continue;

                        case "criar_cobranca": {
                          let codeOrder: any = {};
                          const pickBusiness3 = await prisma.business.findFirst(
                            {
                              where: {
                                name: props.businessName,
                                accountId: props.accountId,
                              },
                              select: { id: true },
                            },
                          );
                          if (!pickBusiness3) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Não foi possivel criar a cobrança. Projeto(${props.businessName}) não encontrado. Error interno!`,
                            });
                            continue;
                          }
                          const status = await NodeCharge({
                            accountId: props.accountId,
                            actions: {
                              onDataCharge(code) {
                                codeOrder = code;
                              },
                            },
                            data: { ...args, businessId: pickBusiness3.id },
                            contactsWAOnAccountId: props.contactAccountId,
                            flowStateId: props.flowStateId,
                            nodeId: props.nodeId,
                          });

                          if (status === "success") {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: JSON.stringify({
                                ...codeOrder,
                                // text: `Criado com sucesso, codigo da cobrança: ${codeOrder}`,
                              }),
                            });
                          } else {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: `Error interno! Não foi possivel criar a cobrança.`,
                            });
                          }

                          continue;
                        }

                        default:
                          if (executeNow) {
                            outputs.push({
                              type: "function_call_output",
                              call_id: c.call_id,
                              output: "OK!",
                            });
                            continue;
                          }
                          outputs.push({
                            type: "function_call_output",
                            call_id: c.call_id,
                            output: `Função ${c.name} ainda não foi implementada.`,
                          });
                      }
                    }
                  }

                  console.log({ outputs });
                  let responseRun: OpenAI.Responses.Response & {
                    _request_id?: string | null;
                  };
                  if (outputs.length) {
                    try {
                      responseRun = await openai.responses.create({
                        model: agent!.model,
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
                        service_tier: agent.service_tier,
                      });
                    } catch (error: any) {
                      const debounceJob = cacheDebounceAgentAI.get(keyMap);
                      const timeoutJob = scheduleTimeoutAgentAI.get(keyMap);
                      console.log("Setou como o debounce parou. 2");
                      cacheDebouceAgentAIRun.set(keyMap, false);
                      debounceJob?.cancel();
                      timeoutJob?.cancel();
                      cacheDebounceAgentAI.delete(keyMap);
                      scheduleTimeoutAgentAI.delete(keyMap);
                      console.log(cacheNextInputsCurrentAgents);
                      cacheMessagesDebouceAgentAI.delete(keyMap);
                      cacheNewMessageWhileDebouceAgentAIRun.delete(keyMap);
                      reject({ ...error.error, line: "2270" });
                      return;
                    }
                    return run({
                      ...responseRun,
                      restart,
                    });
                  } else {
                    return resolveCall({ ...rProps, restart });
                  }
                };
                run(propsCALL);
              });
            };
            const nextresponse = await fnCallPromise(response);

            await prisma.flowState.update({
              where: { id: props.flowStateId },
              data: {
                previous_response_id: nextresponse.id,
                totalTokens: {
                  increment:
                    (nextresponse.usage?.total_tokens || 0) + total_tokens,
                },
                inputTokens: {
                  increment:
                    (nextresponse.usage?.input_tokens || 0) + input_tokens,
                },
                outputTokens: {
                  increment:
                    (nextresponse.usage?.output_tokens || 0) + output_tokens,
                },
              },
            });
            console.log({ isExit: executeNow });
            if (nextresponse.restart) {
              const getNewMessages = cacheMessagesDebouceAgentAI.get(keyMap);
              console.log("Chamou o executeProcess 2");
              return await executeProcess(
                [...msgs, ...(getNewMessages || [])],
                nextresponse.id,
              );
            }

            if (!executeNow) {
              const isNewMsg =
                !!cacheNewMessageWhileDebouceAgentAIRun.get(keyMap);
              // console.log({ isNewMsg }, "JA NO RESULTADO!");
              const newlistMsg = cacheMessagesDebouceAgentAI.get(keyMap) || [];
              if (isNewMsg || nextresponse.restart || newlistMsg.length) {
                if (isSentHere) {
                  const sentPrompt =
                    cacheAgentsSentPromptInstruction.get(keyMap);
                  if (sentPrompt?.length) {
                    cacheAgentsSentPromptInstruction.set(
                      keyMap,
                      sentPrompt.filter((s) => s !== props.nodeId),
                    );
                  }
                }
                console.log("Chamou o executeProcess 3");
                await new Promise((s) => setTimeout(s, 2000));
                await executeProcess(newlistMsg, nextresponse.id);
              } else {
                cacheNextInputsCurrentAgents.delete(props.flowStateId);
                createTimeoutJob(agent!.timeout, nextresponse.id);
              }
            } else {
              const debounceJob = cacheDebounceAgentAI.get(keyMap);
              const timeoutJob = scheduleTimeoutAgentAI.get(keyMap);
              console.log("Setou como o debounce parou. 2");
              cacheDebouceAgentAIRun.set(keyMap, false);
              debounceJob?.cancel();
              timeoutJob?.cancel();
              cacheDebounceAgentAI.delete(keyMap);
              scheduleTimeoutAgentAI.delete(keyMap);
              console.log(cacheNextInputsCurrentAgents);
              cacheMessagesDebouceAgentAI.delete(keyMap);
              cacheNewMessageWhileDebouceAgentAIRun.delete(keyMap);

              if (executeNow.event === "exist") {
                props.actions.onExitNode?.(
                  String(executeNow.value),
                  nextresponse.id,
                );
              } else if (executeNow.event === "enviar_fluxo") {
                props.actions.onSendFlow?.(
                  String(executeNow.value),
                  nextresponse.id,
                );
              } else if (
                executeNow.event === "transferir_para_atendimento_humano"
              ) {
                // irá salvar o nodeId desse agente.
                // essa é o resultado esperado, já que depois de
                // concluir o ticket, deve voltar pro agente.
              }
              return resolve({ run: "exit" });
            }
            return resolve(undefined);
          }
          executeProcess([...listMsg], props.previous_response_id);
        });
      });
    }
    try {
      const res = await runDebounceAgentAI();
      console.log("Setou como o debounce parou. 1");
      cacheDebouceAgentAIRun.set(keyMap, false);
      if (res?.run === "exit") return;
    } catch (error) {
      console.log(error);
      props.actions?.onErrorClient?.();
      return;
    }
    // cacheMessagesDebouceAgentAI.delete(keyMap);
  }

  if (!agent.debounce) {
    execute();
    return { action: "return" };
  }

  const debounceJob = scheduleJob(
    moment()
      .add(agent.debounce || 1, "seconds")
      .toDate(),
    execute,
  );

  cacheDebounceAgentAI.set(keyMap, debounceJob);
  return { action: "return" };
};
