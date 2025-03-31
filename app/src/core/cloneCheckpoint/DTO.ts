export interface CloneCheckpointParamsDTO_I {
  id: number;
}

export interface CloneCheckpointBodyDTO_I {
  accountId: number;
}

export type CloneCheckpointDTO_I = CloneCheckpointParamsDTO_I &
  CloneCheckpointBodyDTO_I;
