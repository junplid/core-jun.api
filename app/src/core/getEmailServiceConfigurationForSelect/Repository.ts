export interface Result {
  id: number;
  host: string;
  port: number;
  user: string;
}

export interface GetEmailServiceConfigurationForSelectRepository_I {
  fetch(data: { accountId: number; businessIds?: number[] }): Promise<Result[]>;
}
