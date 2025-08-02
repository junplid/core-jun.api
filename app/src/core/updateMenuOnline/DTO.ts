export interface UpdateMenuOnlineBodyDTO_I {
  accountId: number;
  identifier?: string;
  desc?: string;
  bg_primary?: string;
  bg_secondary?: string;
  bg_tertiary?: string;
  label1?: string;
  label?: string;
  titlePage?: string;
  status?: boolean;
  fileNameImage?: string;
}

export interface UpdateMenuOnlineParamsDTO_I {
  id: number;
}

export type UpdateMenuOnlineDTO_I = UpdateMenuOnlineParamsDTO_I &
  UpdateMenuOnlineBodyDTO_I;
