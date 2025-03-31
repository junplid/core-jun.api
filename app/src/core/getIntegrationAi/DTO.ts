export interface GetIntegrationAiParamsDTO_I {
  id: number;
}

export interface GetIntegrationAiBodyDTO_I {
  accountId: number;
}

export type GetIntegrationAiDTO_I = GetIntegrationAiBodyDTO_I &
  GetIntegrationAiParamsDTO_I;
