export interface GetAgentTemplatesQueryDTO_I {
  limit: number;
}

export interface GetAgentTemplatesBodyDTO_I {
  accountId?: number;
}

export type GetAgentTemplatesDTO_I = GetAgentTemplatesBodyDTO_I &
  GetAgentTemplatesQueryDTO_I;
