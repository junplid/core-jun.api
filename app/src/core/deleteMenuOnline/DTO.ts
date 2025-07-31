export interface DeleteMenuOnlineParamsDTO_I {
  uuid: string;
}

export interface DeleteMenuOnlineBodyDTO_I {
  accountId: number;
}

export type DeleteMenuOnlineDTO_I = DeleteMenuOnlineBodyDTO_I &
  DeleteMenuOnlineParamsDTO_I;
