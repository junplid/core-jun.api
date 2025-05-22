export interface PropsCloneCampaign {
  name: string;
  description?: string;
  accountId: number;
  businessIds: number[];
  flowId: string;
  audienceIds: number[];
  DenialCampaign: {
    whoHasTag: string | null;
    whoAnsweredConnection: string | null;
    whoIsInFlow: string | null;
    whoIsInCampaign: string | null;
    whoReceivedMessageBefore: string | null;
  } | null;
  campaignParameterId: number | null;
}

export interface CloneCampaignRepository_I {
  fetchExistConnectionOnBusiness(data: {
    connectionOnBusinessId: number;
    accountId: number;
  }): Promise<number>;
  fetchAllContactsOfAudience(
    audienceIds: number[]
  ): Promise<{ id: number; completeNumber: string }[][]>;
  fetchExistFlow(data: { flowId: string; accountId: number }): Promise<number>;
  createAudienceOnCampaign(datas: {
    campaignId: number;
    contactsWAOnAccountOnAudienceIds: number[];
  }): Promise<void>;
  createCampaignOndemand(data: PropsCloneCampaign): Promise<{
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
