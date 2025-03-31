export interface GetIntegrationParamsDTO_I {
  id: number;
}
export interface GetIntegrationBodyDTO_I {
  accountId: number;
}
export type GetIntegrationDTO_I = GetIntegrationBodyDTO_I &
  GetIntegrationParamsDTO_I;
