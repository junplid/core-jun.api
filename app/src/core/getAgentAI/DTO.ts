export interface GetAgentAIParamsDTO_I {
  id: number;
}

export interface GetAgentAIBodyDTO_I {
  accountId: number;
}

export type GetAgentAIDTO_I = GetAgentAIBodyDTO_I & GetAgentAIParamsDTO_I;
