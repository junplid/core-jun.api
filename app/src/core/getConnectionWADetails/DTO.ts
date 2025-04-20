export interface GetConnectionWADetailsParamsDTO_I {
  id: number;
}

export interface GetConnectionWADetailsBodyDTO_I {
  accountId: number;
}

export type GetConnectionWADetailsDTO_I = GetConnectionWADetailsParamsDTO_I &
  GetConnectionWADetailsBodyDTO_I;
