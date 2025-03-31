export interface GetCampaignParameterDetailsParamsDTO_I {
  id: number;
}
export interface GetCampaignParameterDetailsBodyDTO_I {
  accountId: number;
}

export type GetCampaignParameterDetailsDTO_I =
  GetCampaignParameterDetailsParamsDTO_I & GetCampaignParameterDetailsBodyDTO_I;
