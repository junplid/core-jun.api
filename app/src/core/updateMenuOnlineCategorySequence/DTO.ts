export interface UpdateMenuOnlineCategorySequenceParamsDTO_I {
  uuid: string;
}

export interface UpdateMenuOnlineCategorySequenceBodyDTO_I {
  items: string[];
  accountId: number;
}

export type UpdateMenuOnlineCategorySequenceDTO_I =
  UpdateMenuOnlineCategorySequenceParamsDTO_I &
    UpdateMenuOnlineCategorySequenceBodyDTO_I;
