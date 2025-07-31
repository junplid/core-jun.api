export interface DeleteMenuOnlineItemParamsDTO_I {
  uuid: string;
}

export interface DeleteMenuOnlineItemBodyDTO_I {
  accountId: number;
}

export type DeleteMenuOnlineItemDTO_I = DeleteMenuOnlineItemBodyDTO_I &
  DeleteMenuOnlineItemParamsDTO_I;
