export interface DeleteBatchBusinessOnAccountBodyDTO_I {
  accountId: number;
}

export interface DeleteBatchBusinessOnAccountParamsDTO_I {
  batch: number[];
}

export type DeleteBatchBusinessOnAccountDTO_I =
  DeleteBatchBusinessOnAccountParamsDTO_I &
    DeleteBatchBusinessOnAccountBodyDTO_I;
