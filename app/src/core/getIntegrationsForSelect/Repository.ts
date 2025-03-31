import { TypeIntegrations } from "@prisma/client";

export interface ResultGet {
  id: number;
  name: string;
}

export interface GetIntegrationsForSelectRepository_I {
  get(data: {
    accountId: number;
    type?: TypeIntegrations;
  }): Promise<ResultGet[]>;
}
