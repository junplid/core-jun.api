export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteSupervisorRepository_I {
  delete(props: Props): Promise<void>;
}
