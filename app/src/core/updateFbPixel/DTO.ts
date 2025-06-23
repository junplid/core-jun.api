export interface UpdateFbPixelParamsDTO_I {
  id: number;
}

export interface UpdateFbPixelQueryDTO_I {
  name?: string;
  businessId?: number;
  pixel_id?: string;
  access_token?: string;
}

export interface UpdateFbPixelBodyDTO_I {
  accountId: number;
}

export type UpdateFbPixelDTO_I = UpdateFbPixelBodyDTO_I &
  UpdateFbPixelParamsDTO_I &
  UpdateFbPixelQueryDTO_I;
