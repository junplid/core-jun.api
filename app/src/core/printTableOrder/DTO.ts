export interface PrintTableOrderParamsDTO_I {
  tableId: number;
  // payment_method: "Dinheiro" | "PIX" | "Crédito" | "Débito";
}

export interface PrintTableOrderBodyDTO_I {
  accountId: number;
}

export type PrintTableOrderDTO_I = PrintTableOrderBodyDTO_I &
  PrintTableOrderParamsDTO_I;
