export interface UpdateIntegrationParamsDTO_I {
  id: number;
}

export interface UpdateIntegrationQueryDTO_I {
  type?: "trello";
  key?: string;
  token?: string;
  name?: string;
}

export interface UpdateIntegrationBodyDTO_I {
  accountId: number;
}

export type UpdateIntegrationDTO_I = UpdateIntegrationBodyDTO_I &
  UpdateIntegrationParamsDTO_I &
  UpdateIntegrationQueryDTO_I;
