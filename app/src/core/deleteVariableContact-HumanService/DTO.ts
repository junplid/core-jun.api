export interface DeleteVariableContactHumanServiceParamsDTO_I {
  id: number;
  ticketId: number;
}

export interface DeleteVariableContactHumanServiceBodyDTO_I {
  userId: number;
}

export type DeleteVariableContactHumanServiceDTO_I =
  DeleteVariableContactHumanServiceBodyDTO_I &
    DeleteVariableContactHumanServiceParamsDTO_I;
