import { TypeProviderPayment } from "@prisma/client";

export interface CreatePaymentIntegrationDTO_I {
  accountId: number;
  name: string;
  provider: TypeProviderPayment;
  status?: boolean;
  access_token?: string;
  webhook_secret?: string;
  clientId?: string;
  clientSecret?: string;
  certificateBuffer?: Buffer;
  pixKey?: string;
  certPassword?: string;
}
