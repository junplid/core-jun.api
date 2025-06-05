export interface UpdateStorageFileParamsDTO_I {
  id: number;
}

export interface UpdateStorageFileQueryDTO_I {
  originalName?: string;
  businessIds?: number[];
}

export interface UpdateStorageFileBodyDTO_I {
  accountId: number;
}

export type UpdateStorageFileDTO_I = UpdateStorageFileBodyDTO_I &
  UpdateStorageFileParamsDTO_I &
  UpdateStorageFileQueryDTO_I;
