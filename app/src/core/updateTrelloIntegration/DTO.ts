export interface UpdateTrelloIntegrationParamsDTO_I {
  id: number;
}

export interface UpdateTrelloIntegrationBodyDTO_I {
  accountId: number;
  name?: string;
  status?: boolean;
  key?: string;
  token?: string;
}

export type UpdateTrelloIntegrationDTO_I = UpdateTrelloIntegrationParamsDTO_I &
  UpdateTrelloIntegrationBodyDTO_I;
