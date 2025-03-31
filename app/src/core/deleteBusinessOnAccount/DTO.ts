export interface DeleteBusinessOnAccountBodyDTO_I {
  accountId: number;
}

export interface DeleteBusinessOnAccountParamsDTO_I {
  id: number;
}

export type DeleteBusinessOnAccountDTO_I = DeleteBusinessOnAccountParamsDTO_I &
  DeleteBusinessOnAccountBodyDTO_I;
