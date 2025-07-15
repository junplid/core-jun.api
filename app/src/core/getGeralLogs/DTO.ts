export interface GetGeralLogsParamsDTO_I {
  id: number;
}

export interface GetGeralLogsBodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type GetGeralLogsDTO_I = GetGeralLogsBodyDTO_I & GetGeralLogsParamsDTO_I;
