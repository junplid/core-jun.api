export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetRootCouponsForSelectRepository_I {
  fetch(): Promise<ResultFetch[]>;
}
