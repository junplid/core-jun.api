import { TypeProviderPayment } from "@prisma/client";

export interface GetTrelloIntegrationsQueryDTO_I {
  name?: string;
  provider?: TypeProviderPayment;
  page: number;
}

export interface GetTrelloIntegrationsBodyDTO_I {
  accountId: number;
}

export type GetTrelloIntegrationsDTO_I = GetTrelloIntegrationsQueryDTO_I &
  GetTrelloIntegrationsBodyDTO_I;
