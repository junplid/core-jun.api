import { TypeProviderPayment } from "@prisma/client";

export interface UpdatePaymentIntegrationParamsDTO_I {
  id: number;
}

export interface UpdatePaymentIntegrationBodyDTO_I {
  accountId: number;
  name?: string;
  provider: TypeProviderPayment;
  status?: boolean;
  access_token?: string;
}

export type UpdatePaymentIntegrationDTO_I =
  UpdatePaymentIntegrationParamsDTO_I & UpdatePaymentIntegrationBodyDTO_I;
