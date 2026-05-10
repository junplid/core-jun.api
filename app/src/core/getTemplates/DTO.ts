export interface GetTemplatesQueryDTO_I {
  limit: number;
}

export interface GetTemplatesBodyDTO_I {
  accountId?: number;
}

export type GetTemplatesDTO_I = GetTemplatesBodyDTO_I & GetTemplatesQueryDTO_I;
