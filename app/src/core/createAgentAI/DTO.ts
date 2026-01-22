import { TypeServiceTier } from "@prisma/client";

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
  instructions?: string;
  timeout?: number;
  debounce?: number;
  service_tier?: TypeServiceTier;
}
