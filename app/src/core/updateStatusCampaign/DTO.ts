export interface UpdateStatusCampaignBodyDTO_I {
  accountId: number;
}

export interface UpdateStatusCampaignParamsDTO_I {
  id: number;
  status: "paused" | "finished";
}

export type UpdateStatusCampaignDTO_I = UpdateStatusCampaignParamsDTO_I &
  UpdateStatusCampaignBodyDTO_I;
