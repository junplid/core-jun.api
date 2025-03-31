export interface GetTicketParamsDTO_I {
  id: number;
}

export interface GetTicketBodyDTO_I {
  userId: number;
}

export type GetTicketDTO_I = GetTicketParamsDTO_I & GetTicketBodyDTO_I;
