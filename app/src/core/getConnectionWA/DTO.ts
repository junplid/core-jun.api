export interface GetConnectionWAParamsDTO_I {
  id: number;
}

export interface GetConnectionWABodyDTO_I {
  accountId: number;
}

export type GetConnectionWADTO_I = GetConnectionWAParamsDTO_I &
  GetConnectionWABodyDTO_I;
