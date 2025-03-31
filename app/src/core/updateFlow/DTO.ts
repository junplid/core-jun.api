export interface UpdateFlowParamsDTO_I {
  id: number;
}

export interface UpdateFlowBodyDTO_I {
  accountId: number;
  name?: string;
  businessIds?: number[];
  type?: "marketing" | "chatbot";
}

export type UpdateFlowDTO_I = UpdateFlowBodyDTO_I & UpdateFlowParamsDTO_I;
