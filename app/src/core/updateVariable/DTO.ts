export interface UpdateVariableBusinessBodyDTO_I {
  accountId: number;
}

export interface UpdateVariableBusinessParamsDTO_I {
  id: number;
}

export interface UpdateVariableBusinessQueryDTO_I {
  name?: string;
  value?: string;
  businessIds?: number[];
}

export type UpdateVariableBusinessDTO_I = UpdateVariableBusinessQueryDTO_I &
  UpdateVariableBusinessParamsDTO_I &
  UpdateVariableBusinessBodyDTO_I;
