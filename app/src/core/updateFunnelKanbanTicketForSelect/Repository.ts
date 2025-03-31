export interface UpdateFunnelKanbanTicketForSelectRepository_I {
  deleteColumn(props: {
    userId: number;
    columnId: number;
    ticketId: number;
  }): Promise<void>;
  createTicketInColumn(props: {
    columnId: number;
    ticketId: number;
    sequence: number;
  }): Promise<void>;
  fetchTicket(props: {
    ticketId: number;
  }): Promise<{ sequence: number; oldColumnId: number } | null>;
  fetchUser(props: { userId: number }): Promise<{
    businessId: number;
  } | null>;
  fetchTicketExist(props: { ticketId: number }): Promise<boolean>;
}
