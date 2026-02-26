import NodeCache from "node-cache";
import { ICacheTestAgentTemplate } from "../../core/testAgentTemplate/UseCase";
import { SendMessageText } from "../../adapters/Baileys/modules/sendMessage";

/**
 * Cache com a lista de lead que solicitou a interrupção do fluxo
 * key = `{id do contato}+{id da conexão}`
 * #### return o id do bloco que pode executar a interrupção ou false que seria para não executar nada
 */
export const currentNodeFlow = new Map<string, string | false>();

/**
 * Lista de chats com data de retorno
 */
export const cacheWaitForCompletionChatAI = new Map<string, boolean>();

export const cacheControllers = new Map<number, string>();

export const cacheExecuteTimeoutAgentAI = new Map<string, boolean>();

export const cacheTestAgentTemplate = new NodeCache({
  useClones: false,
  stdTTL: 600, // 10min
});

const onUpdateTestTemplateSocket = (
  key: string,
  data: ICacheTestAgentTemplate,
) => {
  SendMessageText({
    mode: "testing",
    accountId: data.accountId,
    role: "system",
    text: `System: Teste finalizado!`,
    token_modal_chat_template: key,
  });
};

cacheTestAgentTemplate.on("expired", onUpdateTestTemplateSocket);
cacheTestAgentTemplate.on("del", onUpdateTestTemplateSocket);
