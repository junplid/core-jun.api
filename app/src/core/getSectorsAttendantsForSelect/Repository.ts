export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetSectorsAttendantsForSelectRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
    sector?: number;
  }): Promise<ResultFetch[]>;
}
