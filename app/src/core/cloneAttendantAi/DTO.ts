export interface CreateCloneAttendantAiParamsDTO_I {
  id: number;
}

export interface CreateCloneAttendantAiBodyDTO_I {
  accountId: number;
}

export type CreateCloneAttendantAiDTO_I = CreateCloneAttendantAiBodyDTO_I &
  CreateCloneAttendantAiParamsDTO_I;
