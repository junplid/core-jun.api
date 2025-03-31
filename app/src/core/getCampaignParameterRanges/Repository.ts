export interface Result {
  name: string;
  timeForShorts: number;
  timeRest: number;
  amountShorts: number;
  sequence: number;
  id: number;
}

export interface GetCampaignParameterRangesRepository_I {
  fetch(): Promise<Result[]>;
}
