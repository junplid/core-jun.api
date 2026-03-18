export interface UpdateMenuOnlineSubItemsStatusParamsDTO_I {
  uuid: string;
}
export interface UpdateMenuOnlineSubItemsStatusBodyDTO_I {
  accountId: number;
  subItemsUuid: string[];
  action: "true" | "false";
}
export type UpdateMenuOnlineSubItemsStatusDTO_I =
  UpdateMenuOnlineSubItemsStatusParamsDTO_I &
    UpdateMenuOnlineSubItemsStatusBodyDTO_I;
