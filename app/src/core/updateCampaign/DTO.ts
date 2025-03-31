export interface UpdateCampaignBodyDTO_I {
  accountId: number;
  name?: string;
  status?: boolean;
  timeToStart?: string;
  businessIds?: number[];
  campaignParameterId?: number;
  audienceIds?: number[];
  connectionOnBusinessIds?: number[];
  description?: string;
  flowId?: number;
  denial?: {
    whoHasTag?: string;
    whoAnsweredConnection?: string;
    whoIsInFlow?: string;
    whoIsInCampaign?: string;
    whoReceivedMessageBefore?: string;
  };
}

export interface UpdateCampaignParamsDTO_I {
  id: number;
}

export type UpdateCampaignDTO_I = UpdateCampaignParamsDTO_I &
  UpdateCampaignBodyDTO_I;
