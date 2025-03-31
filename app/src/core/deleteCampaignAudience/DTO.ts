export interface DeleteCampaignAudienceParamsDTO_I {
  id: number;
}

export interface DeleteCampaignAudienceBodyDTO_I {
  accountId: number;
}

export type DeleteCampaignAudienceDTO_I = DeleteCampaignAudienceBodyDTO_I &
  DeleteCampaignAudienceParamsDTO_I;
