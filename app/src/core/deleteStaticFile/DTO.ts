export interface DeleteStaticFileParamsDTO_I {
  id: number;
}

export interface DeleteStaticFileQueryDTO_I {
  attendantAIId: number;
}

export interface DeleteStaticFileBodyDTO_I {
  accountId: number;
}

export type DeleteStaticFileDTO_I = DeleteStaticFileParamsDTO_I &
  DeleteStaticFileBodyDTO_I &
  DeleteStaticFileQueryDTO_I;
