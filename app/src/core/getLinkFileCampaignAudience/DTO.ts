export interface GetLinkFileCampaignAudienceParamsDTO_I {
  id: number;
}
export interface GetLinkFileCampaignAudienceBodyDTO_I {
  accountId: number;
}

export type GetLinkFileCampaignAudienceDTO_I =
  GetLinkFileCampaignAudienceParamsDTO_I & GetLinkFileCampaignAudienceBodyDTO_I;
