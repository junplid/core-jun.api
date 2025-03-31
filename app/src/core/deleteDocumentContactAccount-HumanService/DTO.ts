export interface DeleteDocumentContactAccountFileParamsDTO_I {
  id: number;
}

export interface DeleteDocumentContactAccountFileBodyDTO_I {
  userId: number;
}

export type DeleteDocumentContactAccountFileDTO_I =
  DeleteDocumentContactAccountFileBodyDTO_I &
    DeleteDocumentContactAccountFileParamsDTO_I;
