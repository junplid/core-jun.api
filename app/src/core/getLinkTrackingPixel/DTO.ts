export interface GetLinkTrackingPixelParamsDTO_I {
  id: number;
}
export interface GetLinkTrackingPixelBodyDTO_I {
  accountId: number;
}

export type GetLinkTrackingPixelDTO_I = GetLinkTrackingPixelParamsDTO_I &
  GetLinkTrackingPixelBodyDTO_I;
