export interface GetSectorsForSelectBodyDTO_I {
  accountId: number;
}

export interface GetSectorsForSelectQueryDTO_I {
  businessIds?: number[];
}

export type GetSectorsForSelectDTO_I = GetSectorsForSelectBodyDTO_I &
  GetSectorsForSelectQueryDTO_I;
