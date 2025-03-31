export interface GetCampaignOndemandParamsDTO_I {
  id: number;
}
export interface GetCampaignOndemandBodyDTO_I {
  accountId: number;
}

export type GetCampaignOndemandDTO_I = GetCampaignOndemandParamsDTO_I &
  GetCampaignOndemandBodyDTO_I;
