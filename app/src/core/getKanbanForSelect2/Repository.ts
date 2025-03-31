export interface ResultFetch {
  name: string;
  id: number;
}

export interface GeKanbanForSelectRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
  }): Promise<ResultFetch[]>;
}
