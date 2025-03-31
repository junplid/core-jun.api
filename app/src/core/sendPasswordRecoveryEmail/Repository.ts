export interface SendPasswordRecoveryEmailRepository_I {
  findAccount(props: {
    email: string;
  }): Promise<{ id: number; hash: string } | null>;
  findHumanService(props: {
    email: string;
  }): Promise<{
    id: number;
    type: "attendant" | "supervisor";
    hash: string;
  } | null>;
}
