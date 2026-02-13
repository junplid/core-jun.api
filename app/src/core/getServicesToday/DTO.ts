export interface GetServicesTodayQueryDTO_I {}

export interface GetServicesTodayBodyDTO_I {
  accountId: number;
}

export type GetServicesTodayDTO_I = GetServicesTodayBodyDTO_I &
  GetServicesTodayQueryDTO_I;
