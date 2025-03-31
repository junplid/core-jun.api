export interface GetTagsContactAccountQueryDTO_I {
  businessId?: number;
  ticketId?: number;
  contactAccountId?: number;
}

export interface GetTagsContactAccountBodyDTO_I {
  userId: number;
}

export type GetTagsContactAccountDTO_I = GetTagsContactAccountBodyDTO_I &
  GetTagsContactAccountQueryDTO_I;
