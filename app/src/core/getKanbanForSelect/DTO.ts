export interface GetKanbanForSelectBodyDTO_I {
  userId: number;
}

export interface GetKanbanForSelectParamsDTO_I {
  ticketId: number;
}

export type GetKanbanForSelectDTO_I = GetKanbanForSelectBodyDTO_I &
  GetKanbanForSelectParamsDTO_I;
