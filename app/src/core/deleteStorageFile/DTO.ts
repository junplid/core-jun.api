export interface DeleteStorageFileParamsDTO_I {
  id: number;
}

export interface DeleteStorageFileBodyDTO_I {
  accountId: number;
}

export type DeleteStorageFileDTO_I = DeleteStorageFileBodyDTO_I &
  DeleteStorageFileParamsDTO_I;
