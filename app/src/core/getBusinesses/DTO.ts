export interface GetBusinessesQueryDTO_I {
  name?: string;
  page: number;
}

export interface GetBusinessesBodyDTO_I {
  accountId: number;
}

export type GetBusinessesDTO_I = GetBusinessesQueryDTO_I &
  GetBusinessesBodyDTO_I;
