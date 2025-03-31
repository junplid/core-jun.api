export interface GetCampaignParameterIdParamsDTO_I {
  id: number;
}

export interface GetCampaignParameterIdBodyDTO_I {
  accountId: number;
}

export type GetCampaignParameterIdDTO_I = GetCampaignParameterIdBodyDTO_I &
  GetCampaignParameterIdParamsDTO_I;
