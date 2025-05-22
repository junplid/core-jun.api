export interface DeleteFlowRepository_I {
  delete(props: { flowId: string }): Promise<void>;
  fetchExist(props: { flowId: string; accountId: number }): Promise<number>;
}
