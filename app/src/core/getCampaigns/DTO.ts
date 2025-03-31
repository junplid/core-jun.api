export interface GetCampaignsQueryDTO_I {
  isOndemand?: number;
}

export interface GetCampaignsBodyDTO_I {
  accountId: number;
}

export type GetCampaignsDTO_I = GetCampaignsQueryDTO_I & GetCampaignsBodyDTO_I;
