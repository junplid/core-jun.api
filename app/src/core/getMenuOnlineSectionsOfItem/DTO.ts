export interface GetMenuOnlineSectionsOfItemParamsDTO_I {
  uuid: string;
  itemUuid: string;
}

export interface GetMenuOnlineSectionsOfItemBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineSectionsOfItemDTO_I =
  GetMenuOnlineSectionsOfItemParamsDTO_I & GetMenuOnlineSectionsOfItemBodyDTO_I;
