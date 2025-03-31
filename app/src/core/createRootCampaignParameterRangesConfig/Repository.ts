export interface PropsCreate {
  name: string;
  timeForShorts: number;
  timeRest: number;
  amountShorts: number;
  sequence: number;
  status: boolean;
}

export interface CreateRootCampaignParameterRangesConfigRepository_I {
  create(data: PropsCreate): Promise<{
    readonly rootCampaignParameterRangesConfigId: number;
  }>;
  fetchExistParameterWithThisNameAtSequence(props: {
    name: string;
    sequence: number;
  }): Promise<number>;
}
