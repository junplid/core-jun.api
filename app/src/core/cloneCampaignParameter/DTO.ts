export interface CloneCampaignParameterParamsDTO_I {
  id: number;
}

export interface CloneCampaignParameterBodyDTO_I {
  accountId: number;
}

export type CloneCampaignParameterDTO_I = CloneCampaignParameterParamsDTO_I &
  CloneCampaignParameterBodyDTO_I;
