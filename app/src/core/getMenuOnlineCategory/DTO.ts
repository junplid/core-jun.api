export interface GetMenuOnlineCategoriesParamsDTO_I {
  uuid: string;
  catUuid: string;
}

export interface GetMenuOnlineCategoriesBodyDTO_I {
  accountId: number;
}

export type GetMenuOnlineCategoriesDTO_I = GetMenuOnlineCategoriesParamsDTO_I &
  GetMenuOnlineCategoriesBodyDTO_I;
