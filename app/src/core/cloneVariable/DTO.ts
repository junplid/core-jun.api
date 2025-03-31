export interface CloneVariableParamsDTO_I {
  id: number;
}

export interface CloneVariableBodyDTO_I {
  accountId: number;
}

export type CloneVariableDTO_I = CloneVariableParamsDTO_I &
  CloneVariableBodyDTO_I;
