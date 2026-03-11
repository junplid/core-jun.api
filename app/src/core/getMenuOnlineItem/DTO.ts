export interface GetMenuOnlineItemParamsDTO_I {
  uuid: string;
  itemUuid: string;
}
export interface GetMenuOnlineItemQueryDTO_I {}

export interface GetMenuOnlineItemBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineItemDTO_I = GetMenuOnlineItemQueryDTO_I &
  GetMenuOnlineItemBodyDTO_I &
  GetMenuOnlineItemParamsDTO_I;
