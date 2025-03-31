export interface UpdateReactivateCampaignBodyDTO_I {
  accountId: number;
}

export interface UpdateReactivateCampaignParamsDTO_I {
  id: number;
}

export type UpdateReactivateCampaignDTO_I =
  UpdateReactivateCampaignParamsDTO_I & UpdateReactivateCampaignBodyDTO_I;
