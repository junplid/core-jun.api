export interface CreateParameterDTO_I {
  name: string;
  rangeId: number;
  sendDuringHoliday: boolean;
  readonly accountId: number;
  timesWork?: {
    startTime?: string | null;
    endTime?: string | null;
    dayOfWeek: number;
  }[];
}
