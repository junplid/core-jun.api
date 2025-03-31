export interface GetSectorsAttendantsForSelectBodyDTO_I {
  accountId: number;
}

export interface GetSectorsAttendantsForSelectQueryDTO_I {
  businessIds?: number[];
  sector?: number;
}

export type GetSectorsAttendantsForSelectDTO_I =
  GetSectorsAttendantsForSelectBodyDTO_I &
    GetSectorsAttendantsForSelectQueryDTO_I;
