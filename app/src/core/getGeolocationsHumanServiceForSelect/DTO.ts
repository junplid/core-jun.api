export interface GetGeolocationHumanServiceForSelectQueryDTO_I {
  name?: string;
}

export interface GetGeolocationHumanServiceForSelectBodyDTO_I {
  userId: number;
}

export type GetGeolocationHumanServiceForSelectDTO_I =
  GetGeolocationHumanServiceForSelectBodyDTO_I &
    GetGeolocationHumanServiceForSelectQueryDTO_I;
