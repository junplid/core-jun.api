export interface GetMenuOnlineParamsDTO_I {
  uuid: string;
}

export interface GetMenuOnlineBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineDTO_I = GetMenuOnlineParamsDTO_I &
  GetMenuOnlineBodyDTO_I;
