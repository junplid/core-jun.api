export interface GetSectorDetailsParamsDTO_I {
  id: number;
}
export interface GetSectorDetailsBodyDTO_I {
  accountId: number;
}

export type GetSectorDetailsDTO_I = GetSectorDetailsBodyDTO_I &
  GetSectorDetailsParamsDTO_I;
