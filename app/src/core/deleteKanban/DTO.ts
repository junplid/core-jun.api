export interface DeleteKanbanParamsDTO_I {
  id: number;
}

export interface DeleteKanbanBodyDTO_I {
  accountId: number;
}

export type DeleteKanbanDTO_I = DeleteKanbanParamsDTO_I & DeleteKanbanBodyDTO_I;
