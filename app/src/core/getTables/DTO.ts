import { TableStatus } from "@prisma/client";

export interface GetTablesQueryDTO_I {
  limit?: number;
  status: TableStatus[];
  name?: string;
}

export interface GetTablesBodyDTO_I {
  accountId: number;
}

export type GetTablesDTO_I = GetTablesBodyDTO_I & GetTablesQueryDTO_I;
