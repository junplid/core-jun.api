export interface UpdateFunnelKanbanTicketForSelectParamsDTO_I {
  ticketId: number;
  columnId: number;
}

export interface UpdateFunnelKanbanTicketForSelectBodyDTO_I {
  userId: number;
}

export type UpdateFunnelKanbanTicketForSelectDTO_I =
  UpdateFunnelKanbanTicketForSelectParamsDTO_I &
    UpdateFunnelKanbanTicketForSelectBodyDTO_I;
