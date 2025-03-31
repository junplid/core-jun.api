export interface CloneGeolocationParamsDTO_I {
  id: number;
}

export interface CloneGeolocationBodyDTO_I {
  accountId: number;
}

export type CloneGeolocationDTO_I = CloneGeolocationParamsDTO_I &
  CloneGeolocationBodyDTO_I;
