export interface PropsCloneCampaignOndemand {
  name: string;
  description?: string;
  accountId: number;
  businessIds: number[];
  flowId: number;
  audienceId: number;
}

export interface CloneCampaignOndemandRepository_I {
  fetchExistConnectionOnBusiness(data: {
    connectionOnBusinessId: number;
    accountId: number;
  }): Promise<number>;
  fetchExistFlow(data: { flowId: number; accountId: number }): Promise<number>;
  createCampaignOndemand(data: PropsCloneCampaignOndemand): Promise<{
    readonly id: number;
    readonly createAt: Date;
    readonly campaignOnBusinessIds: number[];
    readonly business: string;
  }>;
  createConnectionOnCampaign(data: {
    readonly campaignOnBusinessId: number;
    readonly connectionOnBusinessId: number;
  }): Promise<void>;
  fetchExistCampaignWithThisName(props: {
    name: string;
    accountId: number;
    businessIds: number[];
  }): Promise<number>;
  fetchCampaignOnConnections(data: {
    connectionOnBusinessIds: number[];
    accountId: number;
  }): Promise<number>;
}
