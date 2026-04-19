import { TableStatus } from "@prisma/client";

export interface CreateTableDTO_I {
  accountId: number;
  name: string;
  status?: TableStatus;
}
