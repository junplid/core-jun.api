export interface DeleteAtendantAiParamsDTO_I {
  id: number;
}

export interface DeleteAtendantAiBodyDTO_I {
  accountId: number;
}

export type DeleteAtendantAiDTO_I = DeleteAtendantAiParamsDTO_I &
  DeleteAtendantAiBodyDTO_I;
