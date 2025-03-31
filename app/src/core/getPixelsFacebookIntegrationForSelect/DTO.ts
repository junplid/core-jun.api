export interface GetPixelsFacebookIntegrationForSelectParamsDTO_I {
  fbBusinessId: string;
  id: number;
}

export interface GetPixelsFacebookIntegrationForSelectBodyDTO_I {
  accountId: number;
}

export type GetPixelsFacebookIntegrationForSelectDTO_I =
  GetPixelsFacebookIntegrationForSelectBodyDTO_I &
    GetPixelsFacebookIntegrationForSelectParamsDTO_I;
