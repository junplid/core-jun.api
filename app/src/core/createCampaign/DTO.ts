export interface CreateCampaignDTO_I {
  name: string;
  accountId: number;
  timeToStart?: string;
  businessIds: number[];
  campaignParameterId: number;
  audienceIds: number[];
  connectionOnBusinessIds?: number[];
  description?: string;
  flowId: number;
  denial?: {
    whoHasTag?: string;
    whoAnsweredConnection?: string;
    whoIsInFlow?: string;
    whoIsInCampaign?: string;
    whoReceivedMessageBefore?: string;
  };
}
