export interface GetInboxUsersQueryDTO_I {}

export interface GetInboxUsersBodyDTO_I {
  accountId: number;
}

export type GetInboxUsersDTO_I = GetInboxUsersBodyDTO_I &
  GetInboxUsersQueryDTO_I;
