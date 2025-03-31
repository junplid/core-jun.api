export interface Props {
  accountId: number;
}

export interface GetAuthorizationAccountRepository_I {
  fetch(props: Props): Promise<{
    id: number;
    privateKey: string;
  } | null>;
}
