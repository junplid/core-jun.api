export interface GetEmailServiceConfigurationParamsDTO_I {
  id: number;
}
export interface GetEmailServiceConfigurationBodyDTO_I {
  accountId: number;
}
export type GetEmailServiceConfigurationDTO_I =
  GetEmailServiceConfigurationBodyDTO_I &
    GetEmailServiceConfigurationParamsDTO_I;
