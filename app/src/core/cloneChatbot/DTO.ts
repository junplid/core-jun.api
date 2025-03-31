export interface CreateCloneChatbotParamsDTO_I {
  id: number;
}

export interface CreateCloneChatbotBodyDTO_I {
  accountId: number;
}

export type CreateCloneChatbotDTO_I = CreateCloneChatbotBodyDTO_I &
  CreateCloneChatbotParamsDTO_I;
