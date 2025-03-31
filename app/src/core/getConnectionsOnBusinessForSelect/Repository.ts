import { TypeConnetion } from "@prisma/client";

export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetConnectionsOnBusinessForSelectRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
    type?: TypeConnetion;
  }): Promise<ResultFetch[]>;
}
