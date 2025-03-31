export interface GetSubAccountParamsDTO_I {
  id: number;
}

export interface GetSubAccountBodyDTO_I {
  accountId: number;
}

export type GetSubAccountDTO_I = GetSubAccountBodyDTO_I &
  GetSubAccountParamsDTO_I;
