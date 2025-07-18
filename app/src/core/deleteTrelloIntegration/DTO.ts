export interface DeleteTrelloIntegrationParamsDTO_I {
  id: number;
}

export interface DeleteTrelloIntegrationBodyDTO_I {
  accountId: number;
}

export type DeleteTrelloIntegrationDTO_I = DeleteTrelloIntegrationBodyDTO_I &
  DeleteTrelloIntegrationParamsDTO_I;
