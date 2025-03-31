export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteSubAccountRepository_I {
  delete(props: Props): Promise<void>;
}
