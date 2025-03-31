export interface DeleteFlowRepository_I {
  delete(props: { flowId: number }): Promise<void>;
  fetchExist(props: { flowId: number; accountId: number }): Promise<number>;
}
