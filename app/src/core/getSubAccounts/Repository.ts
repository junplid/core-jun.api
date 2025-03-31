export interface Result {
  id: number;
  name: string;
  email: string;
  createAt: Date;
  status: boolean;
}

export interface GetSubAccountsRepository_I {
  fetch(props: { accountId: number }): Promise<Result[]>;
}
