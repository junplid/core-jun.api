export interface DeleteTagContactHumanServiceParamsDTO_I {
  id: number;
  ticketId: number;
}

export interface DeleteTagContactHumanServiceBodyDTO_I {
  userId: number;
}

export type DeleteTagContactHumanServiceDTO_I =
  DeleteTagContactHumanServiceBodyDTO_I &
    DeleteTagContactHumanServiceParamsDTO_I;
