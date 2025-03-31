export interface UpdateDataFlowParamsDTO_I {
  id: number;
}

export interface UpdateDataFlowBodyDTO_I {
  accountId: number;
  data: any;
}

export type UpdateDataFlowDTO_I = UpdateDataFlowBodyDTO_I &
  UpdateDataFlowParamsDTO_I;
