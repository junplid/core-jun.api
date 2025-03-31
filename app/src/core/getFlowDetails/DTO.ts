export interface GetFlowDetailsParamsDTO_I {
  id: number;
}

export interface GetFlowDetailsBodyDTO_I {
  accountId: number;
}

export type GetFlowDetailsDTO_I = GetFlowDetailsParamsDTO_I &
  GetFlowDetailsBodyDTO_I;
