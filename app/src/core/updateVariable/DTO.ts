export interface UpdateVariableBodyDTO_I {
  accountId: number;
}

export interface UpdateVariableParamsDTO_I {
  id: number;
}

export interface UpdateVariableQueryDTO_I {
  name?: string;
  value?: string | null;
  businessIds?: number[];
  type?: "constant" | "dynamics";
}

export type UpdateVariableDTO_I = UpdateVariableQueryDTO_I &
  UpdateVariableParamsDTO_I &
  UpdateVariableBodyDTO_I;
