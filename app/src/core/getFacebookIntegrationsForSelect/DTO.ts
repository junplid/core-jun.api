export interface GetFacebookIntegrationsForSelectQueryDTO_I {
  businessIds?: number[];
  name?: string;
}

export interface GetFacebookIntegrationsForSelectBodyDTO_I {
  accountId: number;
}

export type GetFacebookIntegrationsForSelectDTO_I =
  GetFacebookIntegrationsForSelectBodyDTO_I &
    GetFacebookIntegrationsForSelectQueryDTO_I;
