export interface GetTagParamsDTO_I {
  id: number;
}
export interface GetTagBodyDTO_I {
  accountId: number;
}

export type GetTagDTO_I = GetTagParamsDTO_I & GetTagBodyDTO_I;
