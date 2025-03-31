export interface DeleteSupervisorParamsDTO_I {
  id: number;
}

export interface DeleteSupervisorBodyDTO_I {
  accountId: number;
}

export type DeleteSupervisorDTO_I = DeleteSupervisorParamsDTO_I &
  DeleteSupervisorBodyDTO_I;
