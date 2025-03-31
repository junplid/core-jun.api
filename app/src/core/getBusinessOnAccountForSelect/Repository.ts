export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetBusinessOnAccountForSelectRepository_I {
  fetch(data: {
    accountId: number;
    filterIds?: number[];
  }): Promise<ResultFetch[]>;
}
