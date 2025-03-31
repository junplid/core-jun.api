export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteSectorRepository_I {
  delete(props: Props): Promise<void>;
}
