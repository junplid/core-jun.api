export type ResultGet = {
  id: number;
  name: string;
  createAt: Date;
  business: string;
}[];

export interface GetFunnelKanbansRepository_I {
  get(data: { accountId: number }): Promise<ResultGet>;
}
