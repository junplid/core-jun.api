export interface GetFlowsBodyDTO_I {
  accountId: number;
}

export interface GetFlowsQueryDTO_I {
  name?: string;
  page?: number;
}

export type GetFlowsDTO_I = GetFlowsBodyDTO_I & GetFlowsQueryDTO_I;
