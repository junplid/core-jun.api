export interface DeleteTagOnBusinessParamsDTO_I {
  tagOnBusinessId: number;
}

export interface DeleteTagOnBusinessBodyDTO_I {
  accountId: number;
}

export type DeleteTagOnBusinessDTO_I = DeleteTagOnBusinessBodyDTO_I &
  DeleteTagOnBusinessParamsDTO_I;
