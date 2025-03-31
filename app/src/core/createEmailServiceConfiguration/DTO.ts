export interface CreateEmailServiceConfigurationDTO_I {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
  accountId: number;
  businessIds: number[];
}
