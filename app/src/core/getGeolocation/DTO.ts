export interface GetGeolocationParamsDTO_I {
  id: number;
}

export interface GetGeolocationBodyDTO_I {
  accountId: number;
}

export type GetGeolocationDTO_I = GetGeolocationParamsDTO_I &
  GetGeolocationBodyDTO_I;
