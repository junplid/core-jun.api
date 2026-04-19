export interface GetMenuOnlineItems2ParamsDTO_I {
  uuid: string;
}
export interface GetMenuOnlineItems2QueryDTO_I {}

export interface GetMenuOnlineItems2BodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineItems2DTO_I = GetMenuOnlineItems2QueryDTO_I &
  GetMenuOnlineItems2BodyDTO_I &
  GetMenuOnlineItems2ParamsDTO_I;
