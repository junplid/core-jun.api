export interface UpdatePosFunnelKanbanBodyDTO_I {
  userId: number;
  columnId: number;
  ticketId: number;
}

export interface UpdatePosFunnelKanbanParamsDTO_I {
  funnelKanbanId: number;
}

export type UpdatePosFunnelKanbanDTO_I = UpdatePosFunnelKanbanBodyDTO_I &
  UpdatePosFunnelKanbanParamsDTO_I;
