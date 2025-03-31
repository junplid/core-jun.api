export interface GetCheckpointDetailsParamsDTO_I {
  id: number;
}
export interface GetCheckpointDetailsBodyDTO_I {
  accountId: number;
}

export type GetCheckpointDetailsDTO_I = GetCheckpointDetailsParamsDTO_I &
  GetCheckpointDetailsBodyDTO_I;
