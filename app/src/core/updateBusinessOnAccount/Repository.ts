export interface UpdateBusinessOnAccountRepository_I {
  update(
    where: { id: number; accountId: number },
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<void>;
  fetchExist(props: { id: number; accountId: number }): Promise<number>;
}
