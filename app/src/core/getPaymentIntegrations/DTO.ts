import { TypeProviderPayment } from "@prisma/client";

export interface GetPaymentIntegrationsQueryDTO_I {
  name?: string;
  provider?: TypeProviderPayment;
  page: number;
}

export interface GetPaymentIntegrationsBodyDTO_I {
  accountId: number;
}

export type GetPaymentIntegrationsDTO_I = GetPaymentIntegrationsQueryDTO_I &
  GetPaymentIntegrationsBodyDTO_I;
