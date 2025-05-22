export interface UpdateCampaignOndemandBodyDTO_I {
  accountId: number;
}

export interface UpdateCampaignOndemandParamsDTO_I {
  id: number;
}

export interface UpdateCampaignOndemandQueryDTO_I {
  name?: string;
  businessIds?: number[];
  connectionOnBusinessIds?: number[];
  flowId?: string;
  description?: string;
  status?: boolean;
}

export type UpdateCampaignOndemandDTO_I = UpdateCampaignOndemandQueryDTO_I &
  UpdateCampaignOndemandParamsDTO_I &
  UpdateCampaignOndemandBodyDTO_I;
