export interface CreateChatbotDTO_I {
  accountId: number;
  name: string;
  businessId: number;
  flowId: string;
  connectionWAId?: number;
  status?: boolean;
  description?: string;
  addLeadToAudiencesIds?: number[];
  addToLeadTagsIds?: number[];
  timeToRestart?: {
    value: number;
    type: "seconds" | "minutes" | "hours" | "days";
  };
  operatingDays?: {
    dayOfWeek: number;
    workingTimes?: { start: string; end: string }[];
  }[];
  trigger?: string;
  flowBId?: string;
}
