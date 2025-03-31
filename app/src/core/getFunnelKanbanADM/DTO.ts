export interface GetFunnelKanbanADMParamsDTO_I {
  id: number;
}

export interface GetFunnelKanbanADMBodyDTO_I {
  accountId: number;
}

export type GetFunnelKanbanADMDTO_I = GetFunnelKanbanADMParamsDTO_I &
  GetFunnelKanbanADMBodyDTO_I;
