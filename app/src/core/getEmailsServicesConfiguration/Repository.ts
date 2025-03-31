export interface Result {
  id: number;
  host: string;
  port: number;
  user: string;
  business: string;
  createAt: Date;
}

export interface GetEmailsServicesConfigurationRepository_I {
  fetch(props: { accountId: number }): Promise<Result[]>;
}
