export interface CreateCloneSectorAttendantParamsDTO_I {
  id: number;
}

export interface CreateCloneSectorAttendantBodyDTO_I {
  accountId: number;
}

export type CreateCloneSectorAttendantDTO_I =
  CreateCloneSectorAttendantBodyDTO_I & CreateCloneSectorAttendantParamsDTO_I;
