export interface DeleteTagParamsDTO_I {
  id: number;
}

export interface DeleteTagBodyDTO_I {
  accountId: number;
}

export type DeleteTagDTO_I = DeleteTagBodyDTO_I & DeleteTagParamsDTO_I;
