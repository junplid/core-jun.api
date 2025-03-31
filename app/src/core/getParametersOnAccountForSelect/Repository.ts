export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetParametersOnAccountForSelectRepository_I {
  fetch(data: { accountId: number }): Promise<ResultFetch[]>;
}
