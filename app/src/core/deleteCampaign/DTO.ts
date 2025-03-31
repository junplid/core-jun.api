export interface DeleteCampaignBodyDTO_I {
  accountId: number;
}

export interface DeleteCampaignParamsDTO_I {
  id: number;
}

export type DeleteCampaignDTO_I = DeleteCampaignBodyDTO_I &
  DeleteCampaignParamsDTO_I;
