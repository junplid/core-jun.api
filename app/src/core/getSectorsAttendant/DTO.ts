export interface GetSectorsAttendantParamsDTO_I {
  id: number;
}
export interface GetSectorsAttendantBodyDTO_I {
  accountId: number;
}

export type GetSectorsAttendantDTO_I = GetSectorsAttendantBodyDTO_I &
  GetSectorsAttendantParamsDTO_I;
