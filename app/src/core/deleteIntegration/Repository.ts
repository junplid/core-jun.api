export interface DeleteIntegrationRepository_I {
  delete(props: { accountId: number; id: number }): Promise<void>;
  fetchExist(props: { accountId: number; id: number }): Promise<number>;
}
