export interface GetMenusOnlineQueryDTO_I {}

export interface GetMenusOnlineBodyDTO_I {
  accountId: number;
}

export type GetMenusOnlineDTO_I = GetMenusOnlineQueryDTO_I &
  GetMenusOnlineBodyDTO_I;
