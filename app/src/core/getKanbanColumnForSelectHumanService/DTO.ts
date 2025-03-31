export interface GeKanbanColumnForSelectHumanServiceQueryDTO_I {
  sectorId?: number;
}

export interface GeKanbanColumnForSelectHumanServiceBodyDTO_I {
  userId: number;
}

export type GeKanbanColumnForSelectHumanServiceDTO_I =
  GeKanbanColumnForSelectHumanServiceQueryDTO_I &
    GeKanbanColumnForSelectHumanServiceBodyDTO_I;
