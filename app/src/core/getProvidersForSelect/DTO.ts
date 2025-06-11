export interface GetProvidersForSelectQueryDTO_I {}

export interface GetProvidersForSelectBodyDTO_I {
  accountId: number;
}

export type GetProvidersForSelectDTO_I = GetProvidersForSelectQueryDTO_I &
  GetProvidersForSelectBodyDTO_I;
