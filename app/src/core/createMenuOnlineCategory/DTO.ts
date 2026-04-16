export interface CreateMenuOnlineCategoryParamsDTO_I {
  uuid: string;
}

export interface CreateMenuOnlineCategoryBodyDTO_I {
  accountId: number;
  name: string;
  image45x45png?: string | null;
  startAt?: Date;
  endAt?: Date;
  days_in_the_week?: number[];
}

export type CreateMenuOnlineCategoryDTO_I =
  CreateMenuOnlineCategoryParamsDTO_I & CreateMenuOnlineCategoryBodyDTO_I;
