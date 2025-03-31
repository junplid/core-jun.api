export interface GetLinkTrackingPixelForSelectBodyDTO_I {
  accountId: number;
}

export interface GetLinkTrackingPixelForSelectQueryDTO_I {
  businessIds?: number[];
}

export type GetLinkTrackingPixelForSelectForSelectDTO_I =
  GetLinkTrackingPixelForSelectBodyDTO_I &
    GetLinkTrackingPixelForSelectQueryDTO_I;
