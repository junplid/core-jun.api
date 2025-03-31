export interface GetIntegrationAiForSelectQueryDTO_I {
  name?: string;
  businessIds?: number[];
}

export interface GetIntegrationAiForSelectBodyDTO_I {
  accountId: number;
}

export type GetIntegrationAiForSelectDTO_I =
  GetIntegrationAiForSelectBodyDTO_I & GetIntegrationAiForSelectQueryDTO_I;
