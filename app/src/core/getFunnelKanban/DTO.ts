export interface GetFunnelKanbanParamsDTO_I {
  sectorId: number;
}

export interface GetFunnelKanbanBodyDTO_I {
  userId: number;
}

export type GetFunnelKanbanDTO_I = GetFunnelKanbanParamsDTO_I &
  GetFunnelKanbanBodyDTO_I;
