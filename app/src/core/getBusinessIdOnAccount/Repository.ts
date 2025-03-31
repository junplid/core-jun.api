export interface ResultFetch {
  name: string;
  connections: number;
  audiences: number;
  campaigns: number;
  description: string | null;
  updateAt: Date;
  createAt: Date;
  id: number;
}

export interface GetBusinessIdOnAccountRepository_I {
  fetch(data: { accountId: number; id: number }): Promise<ResultFetch | null>;
}
