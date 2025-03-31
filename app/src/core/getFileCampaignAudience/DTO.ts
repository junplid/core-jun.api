export interface GetFileCampaignAudienceParamsDTO_I {
  id: number;
}
export interface GetFileCampaignAudienceBodyDTO_I {
  accountId: number;
}

export type GetFileCampaignAudienceDTO_I = GetFileCampaignAudienceParamsDTO_I &
  GetFileCampaignAudienceBodyDTO_I;
