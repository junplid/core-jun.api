export interface DeleteExtraPackageParamsDTO_I {
  id: number;
}

export interface DeleteExtraPackageBodyDTO_I {
  rootId: number;
}

export type DeleteExtraPackageDTO_I = DeleteExtraPackageParamsDTO_I &
  DeleteExtraPackageBodyDTO_I;
