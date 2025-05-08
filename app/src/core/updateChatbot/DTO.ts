export interface UpdateChatbotParamsDTO_I {
  id: number;
}

export interface UpdateChatbotBodyQueryDTO_I {
  name?: string;
  businessId?: number;
  flowId?: number;
  connectionWAId?: number;
  status?: boolean;
  description?: string;
  addLeadToAudiencesIds?: number[];
  addToLeadTagsIds?: number[];
  timeToRestart?: {
    value?: number;
    type?: "seconds" | "minutes" | "hours" | "days";
  };
  operatingDays?: {
    dayOfWeek: number;
    workingTimes?: { start: string; end: string }[];
  }[];
}

export interface UpdateChatbotBodyDTO_I {
  accountId: number;
}

export type UpdateChatbotDTO_I = UpdateChatbotBodyDTO_I &
  UpdateChatbotParamsDTO_I &
  UpdateChatbotBodyQueryDTO_I;
