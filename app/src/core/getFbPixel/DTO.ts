export interface GetFbPixelParamsDTO_I {
  id: number;
}
export interface GetFbPixelBodyDTO_I {
  accountId: number;
}

export type GetFbPixelDTO_I = GetFbPixelParamsDTO_I & GetFbPixelBodyDTO_I;
