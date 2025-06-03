export interface GetCampaignParamsDTO_I {
  id: number;
}

export interface GetCampaignBodyDTO_I {
  accountId: number;
}

export type GetCampaignDTO_I = GetCampaignParamsDTO_I & GetCampaignBodyDTO_I;
