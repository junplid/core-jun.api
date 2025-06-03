export interface UpdateCampaignParamsDTO_I {
  id: number;
}

export interface UpdateCampaignBodyDTO_I {
  accountId: number;
  name?: string;
  description?: string;
}

export type UpdateCampaignDTO_I = UpdateCampaignParamsDTO_I &
  UpdateCampaignBodyDTO_I;
