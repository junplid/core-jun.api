export interface DeleteContactWAOnAccountRepository_I {
  fetchExistContactWAOnAccount(props: {
    accountId: number;
    contactWAOnAccountId: number;
  }): Promise<number>;
  deleteContactWAOnAccount(data: {
    accountId: number;
    contactWAOnAccountId: number;
  }): Promise<void>;
}
