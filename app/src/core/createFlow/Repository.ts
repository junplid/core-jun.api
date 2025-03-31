export interface PropsCreate {
  name: string;
  accountId: number;
  businessIds: number[];
  type?: "marketing" | "chatbot";
}

export interface CreateFlowRepository_I {
  create(data: PropsCreate): Promise<{
    readonly flowId: number;
  }>;
  fetchExist(props: {
    name: string;
    accountId: number;
    businessIds: number[];
  }): Promise<number>;
  fetchBusiness(data: { businessIds: number[] }): Promise<string[]>;
}
