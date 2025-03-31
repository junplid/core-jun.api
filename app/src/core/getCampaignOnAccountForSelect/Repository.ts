export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetCampaignOnAccountForSelectRepository_I {
  fetch(data: { accountId: number }): Promise<ResultFetch[]>;
}
