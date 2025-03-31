export interface GetVariableDetailsParamsDTO_I {
  id: number;
}

export interface GetVariableDetailsBodyDTO_I {
  accountId: number;
}

export type GetVariableDetailsDTO_I = GetVariableDetailsBodyDTO_I &
  GetVariableDetailsParamsDTO_I;
