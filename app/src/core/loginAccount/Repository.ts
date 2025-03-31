export interface LoginAccountRepository_I {
  findAccount(props: { email: string }): Promise<
    | {
        password: string;
        id: number;
        hash: string;
        type: "adm";
        customerId: string | null;
      }
    | {
        password: string;
        uid: string;
        type: "subUser";
      }
    | null
  >;
}
