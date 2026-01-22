import { TypeServiceTier } from "@prisma/client";

export interface TestAgentAIDTO_I {
  content: string;
  accountId: number;
  providerCredentialId?: number;
  apiKey?: string;
  tokenTest: string;
  name: string;
  model: string;
  emojiLevel?: "none" | "low" | "medium" | "high";
  personality?: string;
  temperature?: number;
  knowledgeBase?: string;
  files?: number[];
  instructions?: string;
  service_tier?: TypeServiceTier;
}
