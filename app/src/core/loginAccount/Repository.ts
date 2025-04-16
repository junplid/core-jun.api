export interface LoginAccountRepository_I {
  findAccount(props: { email: string }): Promise<{
    password: string;
    id: number;
    type: "adm";
    hash: string;
  } | null>;
}
