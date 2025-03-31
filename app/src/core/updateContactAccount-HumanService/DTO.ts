export interface UpdateContactAccountHumanServiceParamsDTO_I {
  ticketId: number;
}

export interface UpdateContactAccountHumanServiceQueryDTO_I {
  name?: string;
}

export interface UpdateContactAccountHumanServiceBodyDTO_I {
  userId: number;
}

export type UpdateContactAccountHumanServiceDTO_I =
  UpdateContactAccountHumanServiceBodyDTO_I &
    UpdateContactAccountHumanServiceParamsDTO_I &
    UpdateContactAccountHumanServiceQueryDTO_I;
