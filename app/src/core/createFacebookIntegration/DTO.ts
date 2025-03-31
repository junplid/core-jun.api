export interface CreateFacebookIntegrationDTO_I {
  accountId: number;
  name: string;
  description?: string;
  access_token?: string;
  status?: boolean;
  businessIds: number[];
}
