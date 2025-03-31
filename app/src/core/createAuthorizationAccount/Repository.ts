export type Props =
  | {
      accountId: number;
      privateKey: string;
      id?: number;
    }
  | {
      accountId: number;
      privateKey: string;
      id: number;
    };

export interface CreateAuthorizationAccountRepository_I {
  create(props: Props): Promise<void>;
  fetch(props: { accountId: number }): Promise<{ id: number } | null>;
}
