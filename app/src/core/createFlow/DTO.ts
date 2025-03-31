export interface CreateFlowDTO_I {
  name: string;
  type?: "marketing" | "chatbot";
  businessIds: number[];
  accountId: number;
}
