export interface UpdatePasswordHumanServiceDTO_I {
  accountId: number;
  password: string;
  confirmPassword: string;
  type: "attendant" | "supervisor";
}
