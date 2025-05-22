export type PropsCreateCampaign =
  | {
      name: string;
      accountId: number;
      timeToStart?: string;
      campaignParameterId: number;
      businessIds: number[];
      isOndemand?: false;
      denialCampaignId?: number;
      flowId: string;
      description?: string;
      audienceIds: number[];
    }
  | {
      name: string;
      description?: string;
      accountId: number;
      businessIds: number[];
      isOndemand?: true;
      flowId: string;
      audienceIds: number[];
    };

export interface CreateCampaignRepository_I {
  fetchExistConnectionOnBusiness(data: {
    connectionOnBusinessId: number;
    accountId: number;
  }): Promise<number>;
  fetchExistAudience(data: {
    audienceId: number;
    accountId: number;
  }): Promise<number>;
  fetchExistParameter(data: {
    campaignParameterId: number;
    accountId: number;
  }): Promise<number>;
  fetchExistFlow(data: { flowId: string; accountId: number }): Promise<number>;
  createDenial(data: {
    whoHasTag?: string;
    whoAnsweredConnection?: string;
    whoIsInFlow?: string;
    whoIsInCampaign?: string;
    whoReceivedMessageBefore?: string;
  }): Promise<{
    readonly denialCampaignId: number;
  }>;
  // fetchContactsWAOnAudiencesMerge(data: {
  //   campaignAudienceId: number[];
  //   accountId: number;
  // }): Promise<{ readonly contactWAOnAccountId: number[] }>;
  startCampaign(data: { campaignId: number }): Promise<void>;
  // createCampaignAudience(data: {
  //   name: string;
  //   accountId: number;
  //   contactWAOnAccountId: number[];
  // }): Promise<{
  //   readonly campaignAudienceId: number;
  //   contactsWAOnAccountOnCampaignAudienceIds: number[];
  // }>;
  fetchAllContactsOfAudience(
    audienceIds: number[]
  ): Promise<{ id: number; completeNumber: string }[][]>;
  createAudienceOnCampaign(datas: {
    campaignId: number;
    contactsWAOnAccountOnAudienceIds: number[];
  }): Promise<void>;
  createCampaign(data: PropsCreateCampaign): Promise<{
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
