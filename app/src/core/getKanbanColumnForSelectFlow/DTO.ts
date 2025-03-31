export interface GeKanbanColumnForSelectFlowBodyDTO_I {
  accountId: number;
}

export interface GeKanbanColumnForSelectFlowQueryDTO_I {
  businessIds?: number[];
}

export type GeKanbanColumnForSelectFlowDTO_I =
  GeKanbanColumnForSelectFlowBodyDTO_I & GeKanbanColumnForSelectFlowQueryDTO_I;
