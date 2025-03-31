import { TypeIntegrations } from "@prisma/client";

export interface GetIntegrationsForSelectQueryDTO_I {
  type?: TypeIntegrations;
}

export interface GetIntegrationsForSelectBodyDTO_I {
  accountId: number;
}

export type GetIntegrationsForSelectDTO_I = GetIntegrationsForSelectQueryDTO_I &
  GetIntegrationsForSelectBodyDTO_I;
