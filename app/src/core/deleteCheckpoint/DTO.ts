export interface DeleteCheckpointBodyDTO_I {
  accountId: number;
}

export interface DeleteCheckpointParamsDTO_I {
  id: number;
}

export type DeleteCheckpointDTO_I = DeleteCheckpointBodyDTO_I &
  DeleteCheckpointParamsDTO_I;
