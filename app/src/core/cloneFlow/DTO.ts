export interface CreateCloneFlowParamsDTO_I {
  id: number;
}

export interface CreateCloneFlowBodyDTO_I {
  accountId: number;
}

export type CreateCloneFlowDTO_I = CreateCloneFlowBodyDTO_I &
  CreateCloneFlowParamsDTO_I;
