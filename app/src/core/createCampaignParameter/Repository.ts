export interface PropsCreate {
  name: string;
  sendDuringHoliday: boolean;
  rangeId: number;
  accountId: number;
  timesWork?: {
    startTime?: string | null;
    endTime?: string | null;
    dayOfWeek: number;
  }[];
}

export interface PropsFetchExist {
  name: string;
  accountId: number;
}

export interface CreateParameterRepository_I {
  create(data: PropsCreate): Promise<{
    readonly campaignParameterId: number;
    readonly createAt: Date;
  }>;
  fetchExist(props: PropsFetchExist): Promise<number>;
}
