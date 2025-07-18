export interface GetTrelloIntegrationParamsDTO_I {
  id: number;
}

export interface GetTrelloIntegrationBodyDTO_I {
  accountId: number;
}

export type GetTrelloIntegrationDTO_I = GetTrelloIntegrationParamsDTO_I &
  GetTrelloIntegrationBodyDTO_I;
