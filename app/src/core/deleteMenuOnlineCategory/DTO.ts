export interface DeleteMenuOnlineCategoryParamsDTO_I {
  uuid: string;
  categoryUuid: string;
}

export interface DeleteMenuOnlineCategoryBodyDTO_I {
  accountId: number;
}

export type DeleteMenuOnlineCategoryDTO_I =
  DeleteMenuOnlineCategoryParamsDTO_I & DeleteMenuOnlineCategoryBodyDTO_I;
