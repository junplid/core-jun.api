export interface DeleteSectorParamsDTO_I {
  id: number;
}

export interface DeleteSectorBodyDTO_I {
  accountId: number;
}

export type DeleteSectorDTO_I = DeleteSectorParamsDTO_I & DeleteSectorBodyDTO_I;
