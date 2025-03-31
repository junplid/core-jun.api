export interface UpdateFunnelKanbanADMBodyDTO_I {
  accountId: number;
  businessId?: number;
  name?: string;
  columns?: {
    name?: string;
    id?: number;
    color?: string;
    isDelete?: boolean;
    sequence?: number;
  }[];
}

export interface UpdateFunnelKanbanADMParamsDTO_I {
  id: number;
}

export type UpdateFunnelKanbanADMDTO_I = UpdateFunnelKanbanADMBodyDTO_I &
  UpdateFunnelKanbanADMParamsDTO_I;
