export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetRootPlansForSelectRepository_I {
  fetch(): Promise<ResultFetch[]>;
}
