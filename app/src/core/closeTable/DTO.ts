export interface CloseTableParamsDTO_I {
  tableId: number;
  payment_method: "Dinheiro" | "PIX" | "Crédito" | "Débito";
}

export interface CloseTableBodyDTO_I {
  accountId: number;
}

export type CloseTableDTO_I = CloseTableBodyDTO_I & CloseTableParamsDTO_I;
