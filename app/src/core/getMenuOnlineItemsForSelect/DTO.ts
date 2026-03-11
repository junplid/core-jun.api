export interface GetMenuOnlineItemsForSelectParamsDTO_I {
  uuid: string;
}

export interface GetMenuOnlineItemsForSelectBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineItemsForSelectDTO_I =
  GetMenuOnlineItemsForSelectParamsDTO_I & GetMenuOnlineItemsForSelectBodyDTO_I;
