import { TypeConnetion } from "@prisma/client";

export interface GetConnectionsWAForSelectBodyDTO_I {
  accountId: number;
}

export interface GetConnectionsWAForSelectQueryDTO_I {
  businessIds?: number[];
  type?: TypeConnetion;
}

export type GetConnectionsWAForSelectDTO_I =
  GetConnectionsWAForSelectBodyDTO_I & GetConnectionsWAForSelectQueryDTO_I;
