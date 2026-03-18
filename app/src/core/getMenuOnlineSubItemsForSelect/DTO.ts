export interface GetMenuOnlineSubItemsForSelectParamsDTO_I {
  uuid: string;
}

export interface GetMenuOnlineSubItemsForSelectBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineSubItemsForSelectDTO_I =
  GetMenuOnlineSubItemsForSelectParamsDTO_I &
    GetMenuOnlineSubItemsForSelectBodyDTO_I;
