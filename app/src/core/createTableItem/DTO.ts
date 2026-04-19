export interface CreateTableItemParamsDTO_I {
  tableId: number;
}

export interface CreateTableItemBodyDTO_I {
  accountId: number;
  items: {
    qnt: number;
    obs?: string;
    uuid: string;
    sections?: Record<string, Record<string, number>>;
  }[];
}

export type CreateTableItemDTO_I = CreateTableItemBodyDTO_I &
  CreateTableItemParamsDTO_I;
