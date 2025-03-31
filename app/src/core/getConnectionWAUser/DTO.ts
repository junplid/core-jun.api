export interface GetConnectionWAUserParamsDTO_I {
  id: number;
}

export interface GetConnectionWAUserBodyDTO_I {
  accountId: number;
}

export type GetConnectionWAUserDTO_I = GetConnectionWAUserParamsDTO_I &
  GetConnectionWAUserBodyDTO_I;
