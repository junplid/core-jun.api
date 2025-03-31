export interface CloneCampaignParamsDTO_I {
  id: number;
}

export interface CloneCampaignBodyDTO_I {
  accountId: number;
}

export type CloneCampaignDTO_I = CloneCampaignParamsDTO_I &
  CloneCampaignBodyDTO_I;
