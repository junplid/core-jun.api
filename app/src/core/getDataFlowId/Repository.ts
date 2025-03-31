export interface GetDataFlowIdRepository_I {
  fetch(filter: {
    accountId: number;
    _id: number;
  }): Promise<null | {
    nodes: any;
    edges: any;
    name: string;
    type: string;
    businessIds: number[];
  }>;
}
