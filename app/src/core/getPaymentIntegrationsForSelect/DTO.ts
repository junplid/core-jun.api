import { TypeProviderPayment } from "@prisma/client";

export interface GetPaymentIntegrationsForSelectQueryDTO_I {
  name?: string;
  provider?: TypeProviderPayment;
  page: number;
}

export interface GetPaymentIntegrationsForSelectBodyDTO_I {
  accountId: number;
}

export type GetPaymentIntegrationsForSelectDTO_I =
  GetPaymentIntegrationsForSelectQueryDTO_I &
    GetPaymentIntegrationsForSelectBodyDTO_I;
