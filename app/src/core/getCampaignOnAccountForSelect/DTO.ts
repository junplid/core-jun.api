export interface GetCampaignOnAccountForSelectBodyDTO_I {
  accountId: number;
}

export interface GetCampaignOnAccountForSelectQueryDTO_I {
  businessIds?: number[];
}

export type GetCampaignOnAccountForSelectDTO_I =
  GetCampaignOnAccountForSelectBodyDTO_I &
    GetCampaignOnAccountForSelectQueryDTO_I;
