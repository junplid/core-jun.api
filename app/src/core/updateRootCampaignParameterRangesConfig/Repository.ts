export interface PropsUpdate {
  id: number;
  name?: string;
  timeForShorts?: number;
  timeRest?: number;
  amountShorts?: number;
  sequence?: number;
  status?: boolean;
}

export interface UpdateRootCampaignParameterRangesConfigRepository_I {
  update(data: PropsUpdate): Promise<void>;
  fetchExistParameterWithThisNameAtSequence(props: {
    id: number;
    sequence: number;
  }): Promise<number>;
}
