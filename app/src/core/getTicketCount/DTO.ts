import { TypeStatusTicket } from "@prisma/client";

export interface GetTicketCountParamsDTO_I {
  id: number;
}

export interface GetTicketCountQueryDTO_I {
  type?: TypeStatusTicket;
}

export interface GetTicketCountBodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type GetTicketCountDTO_I = GetTicketCountBodyDTO_I &
  GetTicketCountParamsDTO_I &
  GetTicketCountQueryDTO_I;
