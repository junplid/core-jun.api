export interface DeleteAgentAIParamsDTO_I {
  id: number;
}

export interface DeleteAgentAIBodyDTO_I {
  accountId: number;
}

export type DeleteAgentAIDTO_I = DeleteAgentAIBodyDTO_I &
  DeleteAgentAIParamsDTO_I;
