import { Moment } from "moment-timezone";

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
