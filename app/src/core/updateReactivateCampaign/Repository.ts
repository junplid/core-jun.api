export interface UpdateReactivateCampaignRepository_I {
  fetchCampaign(props: {
    id: number;
    accountId: number;
  }): Promise<{
    name: string;
    flowId: number;
    business: { businessId: number; connections: number[] }[];
  } | null>;
  startCampaign(data: { campaignId: number }): Promise<void>;
}
