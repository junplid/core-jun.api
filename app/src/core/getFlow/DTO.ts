export interface GetFlowParamsDTO_I {
  id: number;
}

export interface GetFlowBodyDTO_I {
  accountId: number;
}

export type GetFlowDTO_I = GetFlowParamsDTO_I & GetFlowBodyDTO_I;
