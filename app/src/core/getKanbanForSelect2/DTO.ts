export interface GeKanbanForSelectBodyDTO_I {
  accountId: number;
}

export interface GeKanbanForSelectQueryDTO_I {
  businessIds?: number[];
}

export type GeKanbanForSelectDTO_I = GeKanbanForSelectBodyDTO_I &
  GeKanbanForSelectQueryDTO_I;
