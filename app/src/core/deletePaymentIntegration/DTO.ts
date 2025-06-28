export interface DeletePaymentIntegrationParamsDTO_I {
  id: number;
}

export interface DeletePaymentIntegrationBodyDTO_I {
  accountId: number;
}

export type DeletePaymentIntegrationDTO_I = DeletePaymentIntegrationBodyDTO_I &
  DeletePaymentIntegrationParamsDTO_I;
