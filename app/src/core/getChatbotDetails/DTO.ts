export interface GetChatbotDetailsParamsDTO_I {
  id: number;
}
export interface GetChatbotDetailsBodyDTO_I {
  accountId: number;
}

export type GetChatbotDetailsDTO_I = GetChatbotDetailsParamsDTO_I &
  GetChatbotDetailsBodyDTO_I;
