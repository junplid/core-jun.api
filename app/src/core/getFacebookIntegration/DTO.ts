export interface GetFacebookIntegrationParamsDTO_I {
  id: number;
}
export interface GetFacebookIntegrationBodyDTO_I {
  accountId: number;
}

export type GetFacebookIntegrationDTO_I = GetFacebookIntegrationParamsDTO_I &
  GetFacebookIntegrationBodyDTO_I;
