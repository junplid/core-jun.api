export interface Result {
  id: number;
  name: string;
  business: string;
}

export interface GetLinkTrackingPixelForSelectRepository_I {
  fetch(data: { accountId: number; businessId?: number }): Promise<Result[]>;
}
