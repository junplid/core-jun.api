export interface CreateTagOnContactWAParamsDTO_I {
  id: number;
}

export interface CreateTagOnContactWAQueryDTO_I {
  contactWAId?: number;
  ticketId?: number;
}

export interface CreateTagOnContactWABodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type CreateTagOnContactWADTO_I = CreateTagOnContactWAParamsDTO_I &
  CreateTagOnContactWAQueryDTO_I &
  CreateTagOnContactWABodyDTO_I;
