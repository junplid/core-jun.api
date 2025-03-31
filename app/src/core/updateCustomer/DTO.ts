export interface UpdateCustomerQueryDTO_I {
  name?: string;
  cpfCnpj?: string;
}

export interface UpdateCustomerBodyDTO_I {
  accountId: number;
}

export type UpdateCustomerDTO_I = UpdateCustomerBodyDTO_I &
  UpdateCustomerQueryDTO_I;
