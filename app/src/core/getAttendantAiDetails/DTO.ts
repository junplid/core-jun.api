export interface GetAttendantAiDetailsParamsDTO_I {
  id: number;
}

export interface GetAttendantAiDetailsBodyDTO_I {
  accountId: number;
}

export type GetAttendantAiDetailsDTO_I = GetAttendantAiDetailsParamsDTO_I &
  GetAttendantAiDetailsBodyDTO_I;
