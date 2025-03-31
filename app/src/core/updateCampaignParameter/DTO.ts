export interface UpdateCampaignParameterParamsDTO_I {
  id: number;
}

export interface UpdateCampaignParameterBodyDTO_I {
  accountId: number;
  name?: string;
  rangeId?: number;
  sendDuringHoliday?: boolean;
  timesWork?: {
    id: string | number;
    startTime?: string | null;
    endTime?: string | null;
    dayOfWeek: number;
  }[];
}

export type UpdateCampaignParameterDTO_I = UpdateCampaignParameterBodyDTO_I &
  UpdateCampaignParameterParamsDTO_I;
