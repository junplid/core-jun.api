export interface GetSectorParamsDTO_I {
  id: number;
}
export interface GetSectorBodyDTO_I {
  accountId: number;
}

export type GetSectorDTO_I = GetSectorBodyDTO_I & GetSectorParamsDTO_I;
