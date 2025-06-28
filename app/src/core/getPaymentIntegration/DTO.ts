export interface GetPaymentIntegrationParamsDTO_I {
  id: number;
}

export interface GetPaymentIntegrationBodyDTO_I {
  accountId: number;
}

export type GetPaymentIntegrationDTO_I = GetPaymentIntegrationParamsDTO_I &
  GetPaymentIntegrationBodyDTO_I;
