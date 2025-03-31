export interface GetSomeAccountRepository_I {
  findAccount(accountId: number): Promise<boolean>;
}
