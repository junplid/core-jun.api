export interface GetTicketsQueryDTO_I {
  page?: number;
  status?: "NEW" | "OPEN" | "RESOLVED" | "DELETED";
}

export interface GetTicketsBodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type GetTicketsDTO_I = GetTicketsBodyDTO_I & GetTicketsQueryDTO_I;
