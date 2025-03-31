export interface GetTicketsQueryDTO_I {
  filter?: "unread" | "all" | "serving" | "new" | "pending" | "resolved";
  deleted?: boolean;
  search?: string;
  tags?: number[];
}

export interface GetTicketsBodyDTO_I {
  userId: number;
}

export type GetTicketsDTO_I = GetTicketsQueryDTO_I & GetTicketsBodyDTO_I;
