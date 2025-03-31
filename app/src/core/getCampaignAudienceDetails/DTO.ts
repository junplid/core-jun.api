export interface GetCampaignAudienceDetailsParamsDTO_I {
  id: number;
}
export interface GetCampaignAudienceDetailsBodyDTO_I {
  accountId: number;
}

export type GetCampaignAudienceDetailsDTO_I =
  GetCampaignAudienceDetailsParamsDTO_I & GetCampaignAudienceDetailsBodyDTO_I;
