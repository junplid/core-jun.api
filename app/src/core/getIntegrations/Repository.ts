import { TypeIntegrations } from "@prisma/client";

export interface ResultFetch {
  name: string;
  type: TypeIntegrations;
  key: string | null;
  token: string | null;
  createAt: Date;
  id: number;
}

export interface GetIntegrationsRepository_I {
  fetchContactWAOnAccount(props: { accountId: number }): Promise<ResultFetch[]>;
}
