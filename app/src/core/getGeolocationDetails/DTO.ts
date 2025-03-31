export interface GetGeolocationDetailsParamsDTO_I {
  id: number;
}

export interface GetGeolocationDetailsBodyDTO_I {
  accountId: number;
}

export type GetGeolocationDetailsDTO_I = GetGeolocationDetailsParamsDTO_I &
  GetGeolocationDetailsBodyDTO_I;
