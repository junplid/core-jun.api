export interface GetFlowOnBusinessForSelectBodyDTO_I {
  accountId: number;
}

export interface GetFlowOnBusinessForSelectQueryDTO_I {
  businessIds?: number[];
  type?: ("marketing" | "chatbot")[];
}

export type GetFlowOnBusinessForSelectDTO_I =
  GetFlowOnBusinessForSelectBodyDTO_I & GetFlowOnBusinessForSelectQueryDTO_I;
