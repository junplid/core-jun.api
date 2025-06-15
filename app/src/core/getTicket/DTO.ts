export interface GetTicketParamsDTO_I {
  id: number;
}

export interface GetTicketBodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type GetTicketDTO_I = GetTicketBodyDTO_I & GetTicketParamsDTO_I;
