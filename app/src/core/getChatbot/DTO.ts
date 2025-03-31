export interface GetChatbotParamsDTO_I {
  id: number;
}
export interface GetChatbotBodyDTO_I {
  accountId: number;
}

export type GetChatbotDTO_I = GetChatbotParamsDTO_I & GetChatbotBodyDTO_I;
