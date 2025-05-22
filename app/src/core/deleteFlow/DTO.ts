export interface DeleteFlowParamsDTO_I {
  flowId: string;
}

export interface DeleteFlowBodyDTO_I {
  accountId: number;
}

export type DeleteFlowDTO_I = DeleteFlowBodyDTO_I & DeleteFlowParamsDTO_I;
