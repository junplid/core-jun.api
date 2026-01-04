export interface ReturnTicketParamsDTO_I {
  id: number;
}

export interface ReturnTicketBodyDTO_I {
  accountId?: number;
  userId?: number;
  orderId: number;
}

export type ReturnTicketDTO_I = ReturnTicketParamsDTO_I & ReturnTicketBodyDTO_I;
