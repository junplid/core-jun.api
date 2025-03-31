export interface GetDocumentContactAccountFileParamsDTO_I {
  ticketId: number;
}

export interface GetDocumentContactAccountFileBodyDTO_I {
  userId: number;
}

export type GetDocumentContactAccountFileDTO_I =
  GetDocumentContactAccountFileParamsDTO_I &
    GetDocumentContactAccountFileBodyDTO_I;
