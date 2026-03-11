export interface GetMenuOnlineCategoriesForSelectParamsDTO_I {
  uuid: string;
}

export interface GetMenuOnlineCategoriesForSelectBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineCategoriesForSelectDTO_I =
  GetMenuOnlineCategoriesForSelectParamsDTO_I &
    GetMenuOnlineCategoriesForSelectBodyDTO_I;
