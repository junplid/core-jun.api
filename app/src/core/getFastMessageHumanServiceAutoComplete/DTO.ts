export interface GetFastMessageHumanServiceAutoCompleteParamsDTO_I {
  id: number;
  ticketId: number;
}
export interface GetFastMessageHumanServiceAutoCompleteBodyDTO_I {
  userId: number;
}
export type GetFastMessageHumanServiceAutoCompleteDTO_I =
  GetFastMessageHumanServiceAutoCompleteBodyDTO_I &
    GetFastMessageHumanServiceAutoCompleteParamsDTO_I;
