export interface DeleteInboxUsersParamsDTO_I {
  id: number;
}

export interface DeleteInboxUsersBodyDTO_I {
  accountId: number;
}

export type DeleteInboxUsersDTO_I = DeleteInboxUsersBodyDTO_I &
  DeleteInboxUsersParamsDTO_I;
