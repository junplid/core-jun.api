export interface GetFacebookIntegrationDetailsParamsDTO_I {
  id: number;
}
export interface GetFacebookIntegrationDetailsBodyDTO_I {
  accountId: number;
}

export type GetFacebookIntegrationDetailsDTO_I =
  GetFacebookIntegrationDetailsParamsDTO_I &
    GetFacebookIntegrationDetailsBodyDTO_I;
