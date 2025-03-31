import { TypeConnetion } from "@prisma/client";

export interface IConn {
  name: string;
  type: TypeConnetion;
  businessId: number;
}

export interface GetFieldsConnectionWARepository_I {
  fetch(connWAId: number): Promise<IConn | null>;
}
