export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetSectorsForSelectRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
  }): Promise<ResultFetch[]>;
}
