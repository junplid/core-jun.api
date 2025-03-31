export interface GetIntegrationDetailsParamsDTO_I {
  id: number;
}

export interface GetIntegrationDetailsBodyDTO_I {
  accountId: number;
}

export type GetIntegrationDetailsDTO_I = GetIntegrationDetailsParamsDTO_I &
  GetIntegrationDetailsBodyDTO_I;
