export interface CreateCampaignDTO_I {
  accountId: number;
  name: string;
  flowId: string;
  tagsIds?: number[];
  description?: string;
  businessIds?: number[];
  shootingSpeedId: number;
  connectionIds: number[];
  timeItWillStart?: string;
  operatingDays?: {
    dayOfWeek: number;
    workingTimes?: { start: string; end: string }[];
  }[];
}
