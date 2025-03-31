export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetFlowOnBusinessForSelectRepository_I {
  fetch(data: {
    accountId: number;
    businessIds?: number[];
    type?: ("marketing" | "chatbot")[];
  }): Promise<ResultFetch[]>;
}
