export interface DeleteSubAccountParamsDTO_I {
  id: number;
}

export interface DeleteSubAccountBodyDTO_I {
  accountId: number;
}

export type DeleteSubAccountDTO_I = DeleteSubAccountParamsDTO_I &
  DeleteSubAccountBodyDTO_I;
