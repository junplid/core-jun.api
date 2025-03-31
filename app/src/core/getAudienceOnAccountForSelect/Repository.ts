import { TypeAudience } from "@prisma/client";

export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetAudienceOnAccountForSelectRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
    type?: TypeAudience;
  }): Promise<ResultFetch[]>;
}
