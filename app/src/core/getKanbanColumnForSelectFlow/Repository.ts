export interface ResultFetch {
  name: string;
  id: number;
}

export interface GeKanbanColumnForSelectFlowRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
  }): Promise<ResultFetch[]>;
}
