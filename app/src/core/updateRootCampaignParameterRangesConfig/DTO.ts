export interface UpdateRootCampaignParameterRangesConfigParamsDTO_I {
  id: number;
}

export interface UpdateRootCampaignParameterRangesConfigBodyDTO_I {
  rootId: number;
}

export interface UpdateRootCampaignParameterRangesConfigQueryDTO_I {
  name?: string;
  timeForShorts?: number;
  timeRest?: number;
  amountShorts?: number;
  sequence?: number;
  status?: boolean;
}

export type UpdateRootCampaignParameterRangesConfigDTO_I =
  UpdateRootCampaignParameterRangesConfigBodyDTO_I &
    UpdateRootCampaignParameterRangesConfigParamsDTO_I &
    UpdateRootCampaignParameterRangesConfigQueryDTO_I;
