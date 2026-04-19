export interface DeleteTableParamsDTO_I {
  id: number;
}

export interface DeleteTableBodyDTO_I {
  accountId: number;
}

export type DeleteTableDTO_I = DeleteTableBodyDTO_I & DeleteTableParamsDTO_I;
