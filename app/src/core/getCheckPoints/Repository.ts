export interface Result {
  name: string;
  id: number;
  createAt: Date;
  business: string;
  score: number;
}

export interface GetCheckPointsRepository_I {
  fetch(props: { accountId: number }): Promise<Result[]>;
}
