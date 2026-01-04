export interface PickTicketParamsDTO_I {
  id: number;
}

export interface PickTicketBodyDTO_I {
  accountId?: number;
  userId?: number;
  orderId?: number;
}

export type PickTicketDTO_I = PickTicketParamsDTO_I & PickTicketBodyDTO_I;
