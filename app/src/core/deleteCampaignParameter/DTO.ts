export interface DeleteCampaignParameterParamsDTO_I {
  id: number;
}

export interface DeleteCampaignParameterBodyDTO_I {
  accountId: number;
}

export type DeleteCampaignParameterDTO_I = DeleteCampaignParameterBodyDTO_I &
  DeleteCampaignParameterParamsDTO_I;
