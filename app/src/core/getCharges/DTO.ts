export interface GetChargesQueryDTO_I {}

export interface GetChargesBodyDTO_I {
  accountId: number;
}

export type GetChargesDTO_I = GetChargesBodyDTO_I & GetChargesQueryDTO_I;
