export interface CloneSupervisorParamsDTO_I {
  id: number;
}

export interface CloneSupervisorBodyDTO_I {
  accountId: number;
}

export type CloneSupervisorDTO_I = CloneSupervisorParamsDTO_I &
  CloneSupervisorBodyDTO_I;
