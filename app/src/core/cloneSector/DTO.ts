export interface CreateCloneSectorParamsDTO_I {
  id: number;
}

export interface CreateCloneSectorBodyDTO_I {
  accountId: number;
}

export type CreateCloneSectorDTO_I = CreateCloneSectorBodyDTO_I &
  CreateCloneSectorParamsDTO_I;
