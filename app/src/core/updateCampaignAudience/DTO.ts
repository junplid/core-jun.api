export interface UpdateCampaignAudienceParamsDTO_I {
  id: number;
}

export interface UpdateCampaignAudienceQueryDTO_I {
  name?: string;
  businessIds?: number[];
  tagOnBusinessId?: number[];
}

export interface UpdateCampaignAudienceBodyDTO_I {
  accountId: number;
}

export type UpdateCampaignAudienceDTO_I = UpdateCampaignAudienceBodyDTO_I &
  UpdateCampaignAudienceParamsDTO_I &
  UpdateCampaignAudienceQueryDTO_I;
