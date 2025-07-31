export interface GetMenuOnlineItemsParamsDTO_I {
  uuid: string;
}
export interface GetMenuOnlineItemsQueryDTO_I {}

export interface GetMenuOnlineItemsBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineItemsDTO_I = GetMenuOnlineItemsQueryDTO_I &
  GetMenuOnlineItemsBodyDTO_I &
  GetMenuOnlineItemsParamsDTO_I;
