import { TypeVariable } from "@prisma/client";

export interface Result {
  name: string;
  id: number;
}

export interface GetTagsContactAccountRepository_I {
  fetch(props: { ticketId?: number; businessId?: number }): Promise<Result[]>;
}
