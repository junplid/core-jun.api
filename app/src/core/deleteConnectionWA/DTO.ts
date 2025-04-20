export interface DeleteConnectionWAParamsDTO_I {
  id: number;
}

export interface DeleteConnectionWABodyDTO_I {
  accountId: number;
}

export type DeleteConnectionWADTO_I = DeleteConnectionWABodyDTO_I &
  DeleteConnectionWAParamsDTO_I;
