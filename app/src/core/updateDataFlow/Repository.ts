export interface UpdateDataFlowRepository_I {
  fetchAndUpdate(
    filter: { accountId: number; _id: number },
    data: any
  ): Promise<void>;
}
