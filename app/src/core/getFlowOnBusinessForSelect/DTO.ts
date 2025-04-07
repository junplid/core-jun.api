export interface GetFlowOnBusinessForSelectBodyDTO_I {
  accountId: number;
}

export interface GetFlowOnBusinessForSelectQueryDTO_I {
  businessIds?: number[];
  name?: string;
  type?: ("marketing" | "chatbot" | "universal")[];
}

export type GetFlowOnBusinessForSelectDTO_I =
  GetFlowOnBusinessForSelectBodyDTO_I & GetFlowOnBusinessForSelectQueryDTO_I;
