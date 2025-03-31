export interface GetSupervisorDetailsParamsDTO_I {
  id: number;
}

export interface GetSupervisorDetailsBodyDTO_I {
  accountId: number;
}

export type GetSupervisorDetailsDTO_I = GetSupervisorDetailsParamsDTO_I &
  GetSupervisorDetailsBodyDTO_I;
