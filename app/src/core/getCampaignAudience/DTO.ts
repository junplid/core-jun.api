export interface GetCampaignAudienceParamsDTO_I {
  id: number;
}
export interface GetCampaignAudienceBodyDTO_I {
  accountId: number;
}

export type GetCampaignAudienceDTO_I = GetCampaignAudienceParamsDTO_I &
  GetCampaignAudienceBodyDTO_I;
