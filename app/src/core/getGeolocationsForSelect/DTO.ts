export interface GetGeolocationForSelectQueryDTO_I {
  name?: string;
  businessIds?: number[];
}

export interface GetGeolocationForSelectBodyDTO_I {
  accountId: number;
}

export type GetGeolocationForSelectDTO_I = GetGeolocationForSelectBodyDTO_I &
  GetGeolocationForSelectQueryDTO_I;
