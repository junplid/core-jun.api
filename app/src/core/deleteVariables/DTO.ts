export interface DeleteVariableParamsDTO_I {
  variableId: number;
}

export interface DeleteVariableBodyDTO_I {
  accountId: number;
}

export type DeleteVariableDTO_I = DeleteVariableBodyDTO_I &
  DeleteVariableParamsDTO_I;
