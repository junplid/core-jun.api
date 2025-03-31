export interface DeleteIntegrationBodyDTO_I {
  accountId: number;
}

export interface DeleteIntegrationParamsDTO_I {
  id: number;
}

export type DeleteIntegrationDTO_I = DeleteIntegrationBodyDTO_I &
  DeleteIntegrationParamsDTO_I;
