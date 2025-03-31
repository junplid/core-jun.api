export interface GetVariableHumanServiceAutoCompleteParamsDTO_I {
  id: number;
  ticketId: number;
}
export interface GetVariableHumanServiceAutoCompleteBodyDTO_I {
  userId: number;
}
export type GetVariableHumanServiceAutoCompleteDTO_I =
  GetVariableHumanServiceAutoCompleteBodyDTO_I &
    GetVariableHumanServiceAutoCompleteParamsDTO_I;
