export interface GetInboxUserParamsDTO_I {
  id: number;
}

export interface GetInboxUserBodyDTO_I {
  accountId: number;
}

export type GetInboxUserDTO_I = GetInboxUserBodyDTO_I & GetInboxUserParamsDTO_I;
