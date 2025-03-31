export interface Result {
  name: string;
  sendDuringHoliday: boolean;
  // endTime: string;
  // startTime: string;
  createAt: Date;
  interval: string;
  id: number;
}

export interface GetCampaignParameterRepository_I {
  get(props: { accountId: number }): Promise<Result[]>;
}
