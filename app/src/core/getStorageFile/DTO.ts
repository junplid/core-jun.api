export interface GetStorageFileParamsDTO_I {
  id: number;
}

export interface GetStorageFileBodyDTO_I {
  accountId: number;
}

export type GetStorageFileDTO_I = GetStorageFileBodyDTO_I &
  GetStorageFileParamsDTO_I;
