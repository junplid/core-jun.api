export interface DeleteTableItemParamsDTO_I {
  tableId: number;
  ItemOfOrderId: number;
}

export interface DeleteTableItemBodyDTO_I {
  accountId: number;
}

export type DeleteTableItemDTO_I = DeleteTableItemBodyDTO_I &
  DeleteTableItemParamsDTO_I;
