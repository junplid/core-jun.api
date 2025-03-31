export interface UpdateFunnelKanbanTicketRepository_I {
  updateColumn(props: {
    userId: number;
    funnelId: number;
    columnId: number;
    rows: {
      newSequence: number;
      ticketId: number;
    };
  }): Promise<void>;
  deleteColumn(props: {
    userId: number;
    funnelId: number;
    columnId: number;
    ticketId: number;
  }): Promise<void>;
  createTicketInColumn(props: {
    columnId: number;
    ticketId: number;
    sequence: number;
  }): Promise<void>;
  fetchUser(props: { userId: number }): Promise<{
    businessId: number;
  } | null>;
}
