export interface DeleteContactWAOnAccountParamsDTO_I {
  contactWAOnAccountId: string;
}

export interface DeleteContactWAOnAccountBodyDTO_I {
  accountId: number;
}

export type DeleteContactWAOnAccountDTO_I =
  DeleteContactWAOnAccountParamsDTO_I & DeleteContactWAOnAccountBodyDTO_I;
