export interface GetSectorsAttendantDetailsParamsDTO_I {
  id: number;
}
export interface GetSectorsAttendantDetailsBodyDTO_I {
  accountId: number;
}

export type GetSectorsAttendantDetailsDTO_I =
  GetSectorsAttendantDetailsBodyDTO_I & GetSectorsAttendantDetailsParamsDTO_I;
