export interface DeleteFacebookIntegrationParamsDTO_I {
  id: number;
}

export interface DeleteFacebookIntegrationBodyDTO_I {
  accountId: number;
}

export type DeleteFacebookIntegrationDTO_I =
  DeleteFacebookIntegrationBodyDTO_I & DeleteFacebookIntegrationParamsDTO_I;
