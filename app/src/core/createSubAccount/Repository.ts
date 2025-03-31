import { ModulesPermissions } from "./DTO";

export interface CreateSubAccountRepository_I {
  create(data: {
    accountId: number;
    email: string;
    password: string;
    name: string;
    status: boolean;
    permissions?: {
      create?: Partial<ModulesPermissions>;
      delete?: Partial<ModulesPermissions>;
      update?: Partial<ModulesPermissions>;
    };
  }): Promise<{
    readonly accountId: number;
    readonly createAt: Date;
  }>;
  fetchAlreadyExist(props: {
    accountId: number;
    email: string;
  }): Promise<number>;
}
