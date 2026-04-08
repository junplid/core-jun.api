export interface CreateTestPrintParamsDTO_I {
  uuid: string;
}

export interface CreateTestPrintBodyDTO_I {
  accountId: number;
}

export type CreateTestPrintDTO_I = CreateTestPrintParamsDTO_I &
  CreateTestPrintBodyDTO_I;
