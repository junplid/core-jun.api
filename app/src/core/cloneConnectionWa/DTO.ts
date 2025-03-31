export interface CreateCloneConnectionWaParamsDTO_I {
  id: number;
}

export interface CreateCloneConnectionWaBodyDTO_I {
  accountId: number;
}

export type CreateCloneConnectionWaDTO_I = CreateCloneConnectionWaBodyDTO_I &
  CreateCloneConnectionWaParamsDTO_I;
