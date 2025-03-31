export interface GetVariablesContactAccountQueryDTO_I {
  businessId?: number;
  ticketId?: number;
}

export interface GetVariablesContactAccountBodyDTO_I {
  userId: number;
}

export type GetVariablesContactAccountDTO_I =
  GetVariablesContactAccountBodyDTO_I & GetVariablesContactAccountQueryDTO_I;
