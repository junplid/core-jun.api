export interface GetSupervisorParamsDTO_I {
  id: number;
}

export interface GetSupervisorBodyDTO_I {
  accountId: number;
}

export type GetSupervisorDTO_I = GetSupervisorParamsDTO_I &
  GetSupervisorBodyDTO_I;
