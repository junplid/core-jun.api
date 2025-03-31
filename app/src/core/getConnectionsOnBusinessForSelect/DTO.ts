import { TypeConnetion } from "@prisma/client";

export interface GetConnectionsOnBusinessForSelectBodyDTO_I {
  accountId: number;
}

export interface GetConnectionsOnBusinessForSelectQueryDTO_I {
  businessIds?: number[];
  type?: TypeConnetion;
}

export type GetConnectionsOnBusinessForSelectDTO_I =
  GetConnectionsOnBusinessForSelectBodyDTO_I &
    GetConnectionsOnBusinessForSelectQueryDTO_I;
