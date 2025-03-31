export interface PropsCreate {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean;
  accountId: number;
  businessIds: number[];
}

export interface CreateEmailServiceConfigurationRepository_I {
  create(data: PropsCreate): Promise<{
    readonly createAt: Date;
    readonly updateAt: Date;
    readonly id: number;
    readonly business: string;
  }>;
  fetchExist(props: {
    host: string;
    user: string;
    accountId: number;
    businessIds: number[];
  }): Promise<number>;
}
