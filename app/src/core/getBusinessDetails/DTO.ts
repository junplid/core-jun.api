export interface GetBusinessDetailsBodyDTO_I {
  accountId: number;
}

export interface GetBusinessDetailsParamsDTO_I {
  id: number;
}

export type GetBusinessDetailsDTO_I = GetBusinessDetailsBodyDTO_I &
  GetBusinessDetailsParamsDTO_I;
