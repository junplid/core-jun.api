export interface GetDataFlowIdParamsDTO_I {
  id: string;
}

export interface GetDataFlowIdBodyDTO_I {
  accountId: number;
}

export type GetDataFlowIdDTO_I = GetDataFlowIdBodyDTO_I &
  GetDataFlowIdParamsDTO_I;
