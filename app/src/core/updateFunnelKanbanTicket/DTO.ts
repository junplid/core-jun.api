export interface UpdateFunnelKanbanTicketParamsDTO_I {
  kanbanId: number;
}

export interface UpdateFunnelKanbanTicketBodyDTO_I {
  userId: number;
  columns: {
    id: number;
    rows: {
      newSequence: number;
      ticketId: number;
      delete: boolean;
    }[];
  }[];
}

export type UpdateFunnelKanbanTicketDTO_I =
  UpdateFunnelKanbanTicketParamsDTO_I & UpdateFunnelKanbanTicketBodyDTO_I;
