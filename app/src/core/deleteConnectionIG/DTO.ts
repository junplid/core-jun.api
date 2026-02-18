export interface DeleteConnectionIGParamsDTO_I {
  id: number;
}

export interface DeleteConnectionIGBodyDTO_I {
  accountId: number;
}

export type DeleteConnectionIGDTO_I = DeleteConnectionIGBodyDTO_I &
  DeleteConnectionIGParamsDTO_I;
