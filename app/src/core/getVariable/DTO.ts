export interface GetVariableParamsDTO_I {
  id: number;
}

export interface GetVariableBodyDTO_I {
  accountId: number;
}

export type GetVariableDTO_I = GetVariableBodyDTO_I & GetVariableParamsDTO_I;
