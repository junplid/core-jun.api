export interface GetCampaignDetailsParamsDTO_I {
  id: number;
}
export interface GetCampaignDetailsBodyDTO_I {
  accountId: number;
}

export type GetCampaignDetailsDTO_I = GetCampaignDetailsParamsDTO_I &
  GetCampaignDetailsBodyDTO_I;
