export interface GetBusinessFacebookIntegrationForSelectParamsDTO_I {
  id: number;
}

export interface GetBusinessFacebookIntegrationForSelectQueryDTO_I {
  name?: string;
}

export interface GetBusinessFacebookIntegrationForSelectBodyDTO_I {
  accountId: number;
}

export type GetBusinessFacebookIntegrationForSelectDTO_I =
  GetBusinessFacebookIntegrationForSelectBodyDTO_I &
    GetBusinessFacebookIntegrationForSelectQueryDTO_I &
    GetBusinessFacebookIntegrationForSelectParamsDTO_I;
