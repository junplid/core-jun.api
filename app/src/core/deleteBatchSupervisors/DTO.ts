export interface DeleteBatchSupervisorParamsDTO_I {
  batch: number[];
}

export interface DeleteBatchSupervisorBodyDTO_I {
  accountId: number;
}

export type DeleteBatchSupervisorDTO_I = DeleteBatchSupervisorParamsDTO_I &
  DeleteBatchSupervisorBodyDTO_I;
