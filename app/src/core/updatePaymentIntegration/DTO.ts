export interface UpdatePaymentIntegrationParamsDTO_I {
  id: number;
}

export interface UpdatePaymentIntegrationBodyDTO_I {
  accountId: number;
  name?: string;
}

export type UpdatePaymentIntegrationDTO_I =
  UpdatePaymentIntegrationParamsDTO_I & UpdatePaymentIntegrationBodyDTO_I;
