import { TypeProviderPayment } from "@prisma/client";

export interface GetTrelloIntegrationsForSelectQueryDTO_I {
  name?: string;
  provider?: TypeProviderPayment;
  page: number;
}

export interface GetTrelloIntegrationsForSelectBodyDTO_I {
  accountId: number;
}

export type GetTrelloIntegrationsForSelectDTO_I =
  GetTrelloIntegrationsForSelectQueryDTO_I &
    GetTrelloIntegrationsForSelectBodyDTO_I;
