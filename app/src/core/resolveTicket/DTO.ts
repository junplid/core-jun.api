export interface ResolveTicketParamsDTO_I {
  id: number;
}

export interface ResolveTicketBodyDTO_I {
  accountId?: number;
  userId?: number;
  orderId?: number;
}

export type ResolveTicketDTO_I = ResolveTicketParamsDTO_I &
  ResolveTicketBodyDTO_I;
