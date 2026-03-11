export interface UpdateMenuOnlineStatusParamsDTO_I {
  uuid: string;
}
export interface UpdateMenuOnlineStatusBodyDTO_I {
  accountId: number;
  status: boolean;
}
export type UpdateMenuOnlineStatusDTO_I = UpdateMenuOnlineStatusParamsDTO_I &
  UpdateMenuOnlineStatusBodyDTO_I;
