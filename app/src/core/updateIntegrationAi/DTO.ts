import {
  ModelArtificialIntelligence,
  TypeArtificialIntelligence,
  TypeTag,
} from "@prisma/client";

export interface UpdateIntegrationAiParamsDTO_I {
  id: number;
}

export interface UpdateIntegrationAiQueryDTO_I {
  description?: string;
  apiKey?: string;
  model?: ModelArtificialIntelligence;
  type?: TypeArtificialIntelligence;
  temperature?: 0.0 | 1.0 | 1.3 | 1.5;
  name?: string;
  businessIds?: number[];
}

export interface UpdateIntegrationAiBodyDTO_I {
  accountId: number;
}

export type UpdateIntegrationAiDTO_I = UpdateIntegrationAiBodyDTO_I &
  UpdateIntegrationAiParamsDTO_I &
  UpdateIntegrationAiQueryDTO_I;
