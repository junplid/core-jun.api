export interface GetTagDetailsParamsDTO_I {
  id: number;
}
export interface GetTagDetailsBodyDTO_I {
  accountId: number;
}

export type GetTagDetailsDTO_I = GetTagDetailsParamsDTO_I &
  GetTagDetailsBodyDTO_I;
