export interface UpdateMenuOnlineCategoryParamsDTO_I {
  uuid: string;
  categoryUuid: string;
}

export interface UpdateMenuOnlineCategoryBodyDTO_I {
  accountId: number;
  name?: string;
  image45x45png?: string | null;
  startAt?: Date;
  endAt?: Date;
  days_in_the_week?: number[];
}

export type UpdateMenuOnlineCategoryDTO_I =
  UpdateMenuOnlineCategoryParamsDTO_I & UpdateMenuOnlineCategoryBodyDTO_I;
