import { TableStatus } from "@prisma/client";

export interface UpdateOrderParamsDTO_I {
  id: number;
}

export interface UpdateTableBodyDTO_I {
  accountId: number;
  name?: string;
  status?: TableStatus;
}

export type UpdateTableDTO_I = UpdateTableBodyDTO_I & UpdateOrderParamsDTO_I;
