export interface DeleteSectorAttendantParamsDTO_I {
  id: number;
}

export interface DeleteSectorAttendantBodyDTO_I {
  accountId: number;
}

export type DeleteSectorAttendantDTO_I = DeleteSectorAttendantParamsDTO_I &
  DeleteSectorAttendantBodyDTO_I;
