export interface GetChabotsForSelectQueryDTO_I {
  businessIds?: number[];
  status?: boolean;
}

export interface GetChabotsForSelectBodyDTO_I {
  accountId: number;
}

export type GetChabotsForSelectDTO_I = GetChabotsForSelectQueryDTO_I &
  GetChabotsForSelectBodyDTO_I;
