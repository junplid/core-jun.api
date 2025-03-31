export interface CreateCampaignOndemandDTO_I {
  name: string;
  accountId: number;
  businessIds: number[];
  connectionOnBusinessIds: number[];
  flowId: number;
  description?: string;
  status?: boolean;
  audienceId: number;
}
