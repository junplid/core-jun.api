export interface GetEmailServiceConfigurationDetailsParamsDTO_I {
  id: number;
}
export interface GetEmailServiceConfigurationDetailsBodyDTO_I {
  accountId: number;
}
export type GetEmailServiceConfigurationDetailsDTO_I =
  GetEmailServiceConfigurationDetailsBodyDTO_I &
    GetEmailServiceConfigurationDetailsParamsDTO_I;
