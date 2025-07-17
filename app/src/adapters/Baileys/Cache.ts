import { TypeEmojiLevel } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import NodeCache from "node-cache";
import { Job } from "node-schedule";

export const cacheFlowsMap = new Map<
  string,
  { nodes: any[]; edges: any[]; businessIds: number[] }
>();
export const leadAwaiting: Map<string, boolean> = new Map();
export const scheduleExecutionsReply: Map<string, Job | null> = new Map();
export const cacheJobsChatbotQueue: Map<number, boolean> = new Map();
export const scheduleExecutionsMenu: Map<string, Job | null> = new Map();
export const countAttemptsMenu: Map<string, number> = new Map();
export const cacheConnectionsWAOnline: Map<number, boolean> = new Map();
export const cacheFlowInExecution: Map<string, boolean> = new Map();
export const cacheTestAgentAI = new Map<string, string>();

export const cacheDebounceAgentAI = new Map<string, Job | null>();
export const cacheMessagesDebouceAgentAI = new Map<string, string[]>();
export const cacheNewMessageWhileDebouceAgentAIRun = new Map<string, boolean>();
/**
 * key = `{numero da conexão}+{numero do contato}`
 */
export const chatbotRestartInDate: Map<string, Date> = new Map();

export const cacheDebouceAgentAIRun = new Map<string, boolean>();
export const scheduleTimeoutAgentAI: Map<string, Job | null> = new Map();
export const cacheInfoAgentAI: Map<
  number,
  {
    name: string;
    personality: string | null;
    vectorStoreId: string | null;
    knowledgeBase: string | null;
    instructions: string | null;
    timeout: number;
    emojiLevel: TypeEmojiLevel;
    model: string;
    temperature: Decimal;
    debounce: number;
    apiKey: string;
  }
> = new Map();

export const cacheRunningQueueReaction = new Map<string, boolean>();
export const cachePendingReactionsList = new Map<
  string,
  {
    message: string;
    reactionText: string;
  }[]
>();

export const cacheKnownGroups = new Map<string, string | undefined>();

export const cacheDebounceTimedQueue = new Map<string, Job | null>();

/**
 * key = `{numero da conexão}+{numero do contato}`
 * Retorna uma lista de nodes agent que foram executados;
 */
export const cacheAgentsSentPromptInstruction = new Map<string, string[]>();
