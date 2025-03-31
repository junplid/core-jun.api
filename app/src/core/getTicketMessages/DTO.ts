export interface GetTicketMessagesQueryDTO_I {
  isRead: number;
}

export interface GetTicketMessagesParamsDTO_I {
  id: number;
}

export interface GetTicketMessagesBodyDTO_I {
  userId: number;
}

export type GetTicketMessagesDTO_I = GetTicketMessagesBodyDTO_I &
  GetTicketMessagesParamsDTO_I &
  GetTicketMessagesQueryDTO_I;
