export interface DeleteFlowParamsDTO_I {
  flowId: number;
}

export interface DeleteFlowBodyDTO_I {
  accountId: number;
}

export type DeleteFlowDTO_I = DeleteFlowBodyDTO_I & DeleteFlowParamsDTO_I;
