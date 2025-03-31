export interface GetEmailServiceConfigurationForSelectBodyDTO_I {
  accountId: number;
}

export interface GetEmailServiceConfigurationForSelectQueryDTO_I {
  businessIds?: number[];
}

export type GetEmailServiceConfigurationForSelectForSelectDTO_I =
  GetEmailServiceConfigurationForSelectBodyDTO_I &
    GetEmailServiceConfigurationForSelectQueryDTO_I;
