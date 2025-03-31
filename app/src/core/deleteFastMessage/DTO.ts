export interface DeleteFastMessageParamsDTO_I {
  id: number;
}

export interface DeleteFastMessageBodyDTO_I {
  accountId?: number;
  userId?: number;
}

export type DeleteFastMessageDTO_I = DeleteFastMessageBodyDTO_I &
  DeleteFastMessageParamsDTO_I;
