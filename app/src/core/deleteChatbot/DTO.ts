export interface DeleteChatbotParamsDTO_I {
  id: number;
}

export interface DeleteChatbotBodyDTO_I {
  accountId: number;
}

export type DeleteChatbotDTO_I = DeleteChatbotParamsDTO_I &
  DeleteChatbotBodyDTO_I;
