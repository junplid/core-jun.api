export interface CloneSubAccountParamsDTO_I {
  id: number;
}

export interface CloneSubAccountBodyDTO_I {
  accountId: number;
}

export type CloneSubAccountDTO_I = CloneSubAccountParamsDTO_I &
  CloneSubAccountBodyDTO_I;
