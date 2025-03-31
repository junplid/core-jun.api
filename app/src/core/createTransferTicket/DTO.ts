export interface CreateTransferTicketDTO_I {
  userId: number;
  ticketId: number;
  sectorId: number;
  attendantId?: number;
  type: "attendant" | "sector";
  columnId: number;
}
