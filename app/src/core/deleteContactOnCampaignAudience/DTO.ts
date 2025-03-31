export interface DeleteContactOnCampaignAudienceParamsDTO_I {
  id: number;
  audienceId: number;
}

export interface DeleteContactOnCampaignAudienceBodyDTO_I {
  accountId: number;
}

export type DeleteContactOnCampaignAudienceDTO_I =
  DeleteContactOnCampaignAudienceParamsDTO_I &
    DeleteContactOnCampaignAudienceBodyDTO_I;
