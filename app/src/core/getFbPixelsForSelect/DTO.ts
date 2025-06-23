export interface GetFbPixelsForSelectBodyDTO_I {
  accountId: number;
}

export interface GetFbPixelsForSelectQueryDTO_I {
  businessId?: number[];
}

export type GetFbPixelsForSelectDTO_I = GetFbPixelsForSelectBodyDTO_I &
  GetFbPixelsForSelectQueryDTO_I;
