export interface DeleteCampaignParamsDTO_I {
  id: number;
}

export interface DeleteCampaignBodyDTO_I {
  accountId: number;
}

export type DeleteCampaignDTO_I = DeleteCampaignParamsDTO_I &
  DeleteCampaignBodyDTO_I;
