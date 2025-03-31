export interface GetPlanParamsDTO_I {
  id: number;
}
export interface GetPlanQueryDTO_I {
  affiliate?: string;
}
export interface GetPlanBodyDTO_I {
  accountId?: number;
}
export type GetPlanDTO_I = GetPlanParamsDTO_I &
  GetPlanQueryDTO_I &
  GetPlanBodyDTO_I;
