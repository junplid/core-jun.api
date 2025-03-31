export interface GetSubAccountDetailsParamsDTO_I {
  id: number;
}

export interface GetSubAccountDetailsBodyDTO_I {
  accountId: number;
}

export type GetSubAccountDetailsDTO_I = GetSubAccountDetailsBodyDTO_I &
  GetSubAccountDetailsParamsDTO_I;
