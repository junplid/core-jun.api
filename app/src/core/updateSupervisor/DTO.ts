export interface UpdateSupervisorParamsDTO_I {
  id: number;
}

export interface UpdateSupervisorQueryDTO_I {
  name?: string;
  password?: string;
  username?: string;
  businessIds?: number[];
  sectorIds?: number[];
}

export interface UpdateSupervisorBodyDTO_I {
  accountId: number;
}

export type UpdateSupervisorDTO_I = UpdateSupervisorParamsDTO_I &
  UpdateSupervisorQueryDTO_I &
  UpdateSupervisorBodyDTO_I;
