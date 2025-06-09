export interface CreateAgentAIDTO_I {
  accountId: number;
  providerCredentialId?: number;
  apiKey?: string;
  nameProvider?: string;
  businessIds: number[];
  name: string;
  emojiLevel?: "none" | "low" | "medium" | "high";
  language?: string;
  personality?: string;
  model: string;
  temperature?: number;
  knowledgeBase?: string;
  files?: number[];
  instructions?: {
    prompt?: string;
    promptAfterReply?: string;
    files?: number[];
  }[];
}
