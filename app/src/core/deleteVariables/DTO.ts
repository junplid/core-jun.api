export interface DeleteVariableParamsDTO_I {
  id: number;
}

export interface DeleteVariableBodyDTO_I {
  accountId: number;
}

export type DeleteVariableDTO_I = DeleteVariableBodyDTO_I &
  DeleteVariableParamsDTO_I;
