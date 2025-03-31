export interface GetContactWAOnAccountQueryDTO_I {
  campaignAudienceIds?: number[];
  limit?: number;
  page?: number;
}

export interface GetContactWAOnAccountBodyDTO_I {
  accountId: number;
}

export type GetContactWAOnAccountDTO_I = GetContactWAOnAccountBodyDTO_I &
  GetContactWAOnAccountQueryDTO_I;
