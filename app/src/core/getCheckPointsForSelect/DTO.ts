export interface GetCheckPointsForSelectQueryDTO_I {
  businessIds?: number[];
}

export interface GetCheckPointsForSelectBodyDTO_I {
  accountId: number;
}

export type GetCheckPointsForSelectDTO_I = GetCheckPointsForSelectQueryDTO_I &
  GetCheckPointsForSelectBodyDTO_I;
