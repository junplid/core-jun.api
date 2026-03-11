export interface UpdateMenuOnlineOperatingDaysBodyDTO_I {
  accountId: number;
  days: {
    dayOfWeek: number;
    startHourAt: string;
    endHourAt: string;
  }[];
}

export interface UpdateMenuOnlineOperatingDaysParamsDTO_I {
  uuid: string;
}

export type UpdateMenuOnlineOperatingDaysDTO_I =
  UpdateMenuOnlineOperatingDaysParamsDTO_I &
    UpdateMenuOnlineOperatingDaysBodyDTO_I;
