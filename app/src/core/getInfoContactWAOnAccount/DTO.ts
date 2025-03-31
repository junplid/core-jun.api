export interface GetContactWAOnAccountParamsDTO_I {
  id: number;
}

export interface GetContactWAOnAccountBodyDTO_I {
  accountId: number;
}

export type GetContactWAOnAccountDTO_I = GetContactWAOnAccountParamsDTO_I &
  GetContactWAOnAccountBodyDTO_I;
