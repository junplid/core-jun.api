export interface UpdateAccountDTO_I {
  accountId: number;
  email?: string;
  name?: string;
  number?: string;
  onboarded?: boolean;
  currentPassword?: string;
  nextPassword?: string;
}
