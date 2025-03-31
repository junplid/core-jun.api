export interface GetVariablesForSelectHumanServiceBodyDTO_I {
  userId: number;
}

export interface GetVariablesForSelectHumanServiceQueryDTO_I {
  name?: string;
  ticketId?: number;
}

export type GetVariablesForSelectHumanServiceDTO_I =
  GetVariablesForSelectHumanServiceQueryDTO_I &
    GetVariablesForSelectHumanServiceBodyDTO_I;
