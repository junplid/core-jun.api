export interface GetBusinessIdOnAccountBodyDTO_I {
  accountId: number;
}

export interface GetBusinessIdOnAccountParamsDTO_I {
  id: number;
}

export type GetBusinessIdOnAccountDTO_I = GetBusinessIdOnAccountBodyDTO_I &
  GetBusinessIdOnAccountParamsDTO_I;
