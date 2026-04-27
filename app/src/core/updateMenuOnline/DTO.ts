export interface UpdateMenuOnlineBodyDTO_I {
  accountId: number;
  fileNameImage?: string;
  fileNameCapaImage?: string;
  identifier: string;
  titlePage: string | null;
  desc: string | null;
  bg_primary: string | null;
  bg_secondary: string | null;
  bg_tertiary: string | null;
  bg_capa: string | null;
  connectionWAId: number;
  is_accepting_motoboys: boolean;
}

export interface UpdateMenuOnlineParamsDTO_I {
  id: number;
}

export type UpdateMenuOnlineDTO_I = UpdateMenuOnlineParamsDTO_I &
  UpdateMenuOnlineBodyDTO_I;
