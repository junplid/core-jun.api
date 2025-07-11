import { TypePriorityOrder, TypeStatusOrder } from "@prisma/client";

export interface GetOrdersQueryDTO_I {
  page?: number;
  limit?: number;
  status?: TypeStatusOrder;
  priority?: TypePriorityOrder;
}

export interface GetOrdersBodyDTO_I {
  accountId: number;
}

export type GetOrdersDTO_I = GetOrdersBodyDTO_I & GetOrdersQueryDTO_I;
