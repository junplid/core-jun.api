export interface UpdateSectorAttendantOnHumanServiceBodyDTO_I {
  userId: number;
}

export interface UpdateSectorAttendantOnHumanServiceQueryDTO_I {
  name?: string;
  password?: string;
  username?: string;
}

export type UpdateSectorAttendantOnHumanServiceDTO_I =
  UpdateSectorAttendantOnHumanServiceBodyDTO_I &
    UpdateSectorAttendantOnHumanServiceQueryDTO_I;
