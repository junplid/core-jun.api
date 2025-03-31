export interface GetAttendantAiForSelectQueryDTO_I {
  name?: string;
  businessIds?: number[];
}

export interface GetAttendantAiForSelectBodyDTO_I {
  accountId: number;
}

export type GetAttendantAiForSelectDTO_I = GetAttendantAiForSelectBodyDTO_I &
  GetAttendantAiForSelectQueryDTO_I;
