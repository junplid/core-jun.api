export interface Result {
  name: string;
  timeForShorts: number;
  timeRest: number;
  amountShorts: number;
  sequence: number;
  status: boolean;
  id: number;
}

export interface GetRootCampaignParameterRangesConfigRepository_I {
  fetch(): Promise<Result[]>;
}
