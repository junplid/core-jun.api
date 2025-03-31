export interface DeleteIntegrationAiParamsDTO_I {
  id: number;
}

export interface DeleteIntegrationAiBodyDTO_I {
  accountId: number;
}

export type DeleteIntegrationAiDTO_I = DeleteIntegrationAiParamsDTO_I &
  DeleteIntegrationAiBodyDTO_I;
