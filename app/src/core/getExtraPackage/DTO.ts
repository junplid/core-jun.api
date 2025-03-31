export interface GetExtraPackageBodyDTO_I {
  accountId: number;
}

export interface GetExtraPackageParamsDTO_I {
  id: number;
}

export type GetExtraPackageDTO_I = GetExtraPackageParamsDTO_I &
  GetExtraPackageBodyDTO_I;
