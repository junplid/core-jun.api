export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetRootExtraPackagesForSelectRepository_I {
  fetch(): Promise<ResultFetch[]>;
}
