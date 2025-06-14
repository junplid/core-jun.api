import { TypeEmojiLevel } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
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
export const cacheNewMessageOnDebouceAgentAI = new Map<string, boolean>();

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
    ProviderCredential: { apiKey: string };
  }
> = new Map();
