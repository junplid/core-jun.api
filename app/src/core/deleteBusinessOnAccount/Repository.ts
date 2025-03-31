export interface DeleteBusinessOnAccountRepository_I {
  delete(data: { id: number; accountId: number }): Promise<void>;
  fetchExist(props: { id: number; accountId: number }): Promise<number>;
}
