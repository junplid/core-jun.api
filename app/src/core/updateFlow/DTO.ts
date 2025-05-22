export interface UpdateFlowParamsDTO_I {
  id: string;
}

export interface UpdateFlowQueryDTO_I {
  name?: string;
  businessIds?: number[];
  type?: "marketing" | "chatbot" | "universal";
}

export interface UpdateFlowBodyDTO_I {
  accountId: number;
}

export type UpdateFlowDTO_I = UpdateFlowBodyDTO_I &
  UpdateFlowParamsDTO_I &
  UpdateFlowQueryDTO_I;
