export interface GetIntegrationAiDetailsParamsDTO_I {
  id: number;
}

export interface GetIntegrationAiDetailsBodyDTO_I {
  accountId: number;
}

export type GetIntegrationAiDetailsDTO_I = GetIntegrationAiDetailsParamsDTO_I &
  GetIntegrationAiDetailsBodyDTO_I;
