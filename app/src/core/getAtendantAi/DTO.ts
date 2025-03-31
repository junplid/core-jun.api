export interface GetAttendantAiParamsDTO_I {
  id: number;
}

export interface GetAttendantAiBodyDTO_I {
  accountId: number;
}

export type GetAttendantAiDTO_I = GetAttendantAiBodyDTO_I &
  GetAttendantAiParamsDTO_I;
