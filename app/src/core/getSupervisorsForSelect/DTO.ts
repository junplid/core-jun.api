export interface GeSupervisorsForSelectBodyDTO_I {
  accountId: number;
}

export interface GeSupervisorsForSelectQueryDTO_I {
  businessIds?: number[];
}

export type GeSupervisorsForSelectDTO_I = GeSupervisorsForSelectBodyDTO_I &
  GeSupervisorsForSelectQueryDTO_I;
