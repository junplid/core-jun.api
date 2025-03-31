export interface UpdateFacebookIntegrationParamsDTO_I {
  id: number;
}

export interface UpdateFacebookIntegrationQueryDTO_I {
  name?: string;
  description?: string;
  access_token?: string;
  status?: boolean;
  businessIds?: number[];
}

export interface UpdateFacebookIntegrationBodyDTO_I {
  accountId: number;
}

export type UpdateFacebookIntegrationDTO_I =
  UpdateFacebookIntegrationBodyDTO_I &
    UpdateFacebookIntegrationParamsDTO_I &
    UpdateFacebookIntegrationQueryDTO_I;
