export interface ResultFetch {
  name: string;
  id: number;
}

export interface IProps {
  sectorId?: number;
  userId: number;
}

export interface GeKanbanColumnForSelectHumanServiceRepository_I {
  fetch(props: IProps): Promise<ResultFetch[]>;
}
