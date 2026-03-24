export interface GenerateMenuOnlineReportParamsDTO_I {
  uuid: string;
}

export interface GenerateMenuOnlineReportBodyDTO_I {
  accountId: number;
  start: Date;
  end: Date;
}

export type GenerateMenuOnlineReportDTO_I =
  GenerateMenuOnlineReportParamsDTO_I & GenerateMenuOnlineReportBodyDTO_I;
