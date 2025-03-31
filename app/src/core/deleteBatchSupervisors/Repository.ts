export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteBatchSupervisorRepository_I {
  delete(props: Props): Promise<void>;
  fetchExist(props: { id: number; accountId: number }): Promise<number>;
}
