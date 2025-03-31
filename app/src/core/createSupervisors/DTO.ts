export interface CreateSupervisorDTO_I {
  name: string;
  username: string;
  password: string;
  accountId: number;
  businessIds: number[];
  sectorIds?: number[];
}
