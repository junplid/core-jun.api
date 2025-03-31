export interface GetSectorsAttendantsForSelectHumanServiceBodyDTO_I {
  userId: number;
}

export interface GetSectorsAttendantsForSelectHumanServiceQueryDTO_I {
  sectorId?: number;
}

export type GetSectorsAttendantsForSelectHumanServiceDTO_I =
  GetSectorsAttendantsForSelectHumanServiceBodyDTO_I &
    GetSectorsAttendantsForSelectHumanServiceQueryDTO_I;
