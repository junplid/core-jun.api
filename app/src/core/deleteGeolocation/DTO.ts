export interface DeleteGeolocationParamsDTO_I {
  id: number;
}

export interface DeleteGeolocationBodyDTO_I {
  accountId: number;
}

export type DeleteGeolocationDTO_I = DeleteGeolocationParamsDTO_I &
  DeleteGeolocationBodyDTO_I;
