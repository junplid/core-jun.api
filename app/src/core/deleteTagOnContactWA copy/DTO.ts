export interface DeleteTagOnContactWAParamsDTO_I {
  id: number;
}

export interface DeleteTagOnContactWAQueryDTO_I {
  contactWAId?: number;
  ticketId?: number;
}

export interface DeleteTagOnContactWABodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type DeleteTagOnContactWADTO_I = DeleteTagOnContactWAParamsDTO_I &
  DeleteTagOnContactWAQueryDTO_I &
  DeleteTagOnContactWABodyDTO_I;
