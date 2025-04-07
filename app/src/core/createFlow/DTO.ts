export interface CreateFlowDTO_I {
  name: string;
  type?: "marketing" | "chatbot" | "universal";
  businessIds?: number[];
  accountId: number;
}
