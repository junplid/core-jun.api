export interface DeleteFbPixelParamsDTO_I {
  id: number;
}

export interface DeleteFbPixelBodyDTO_I {
  accountId: number;
}

export type DeleteFbPixelDTO_I = DeleteFbPixelBodyDTO_I &
  DeleteFbPixelParamsDTO_I;
