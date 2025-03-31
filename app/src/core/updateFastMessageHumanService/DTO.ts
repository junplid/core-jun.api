export interface UpdateFastMessageHumanServiceBodyDTO_I {
  userId: number;
}

export interface UpdateFastMessageHumanServiceParamsDTO_I {
  id: number;
}

export interface UpdateFastMessageHumanServiceQueryDTO_I {
  shortcut?: string;
  value?: string;
}

export type UpdateFastMessageHumanServiceDTO_I =
  UpdateFastMessageHumanServiceQueryDTO_I &
    UpdateFastMessageHumanServiceParamsDTO_I &
    UpdateFastMessageHumanServiceBodyDTO_I;
