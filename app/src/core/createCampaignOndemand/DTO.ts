export interface CreateCampaignOndemandDTO_I {
  name: string;
  accountId: number;
  businessIds: number[];
  connectionOnBusinessIds: number[];
  flowId: string;
  description?: string;
  status?: boolean;
  audienceId: number;
}
