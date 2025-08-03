import { TypeStatusOrder } from "@prisma/client";

export interface GetOrdersQueryDTO_I {
  limit?: number;
  status: TypeStatusOrder[];
  menu?: string;
}

export interface GetOrdersBodyDTO_I {
  accountId: number;
}

export type GetOrdersDTO_I = GetOrdersBodyDTO_I & GetOrdersQueryDTO_I;
