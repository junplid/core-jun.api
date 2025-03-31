export interface GetCheckpointParamsDTO_I {
  id: number;
}
export interface GetCheckpointBodyDTO_I {
  accountId: number;
}

export type GetCheckpointDTO_I = GetCheckpointParamsDTO_I &
  GetCheckpointBodyDTO_I;
