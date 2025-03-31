import { TypeVariable } from "@prisma/client";

export interface Result {
  name: string;
  id: number;
  value: string | null;
}

export interface GetVariablesContactAccountRepository_I {
  fetch(props: { ticketId?: number; businessId?: number }): Promise<Result[]>;
}
