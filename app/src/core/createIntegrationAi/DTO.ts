import {
  ModelArtificialIntelligence,
  TypeArtificialIntelligence,
} from "@prisma/client";

export interface CreateIntegrationAiDTO_I {
  name: string;
  businessIds: number[];
  accountId: number;
  description?: string;
  apiKey: string;
  model: ModelArtificialIntelligence;
  type: TypeArtificialIntelligence;
  temperature?: 0.0 | 1.0 | 1.3 | 1.5;
}
