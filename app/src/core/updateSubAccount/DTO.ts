import { ModulesPermissions } from "../createSubAccount/DTO";

export interface CreateSubAccountDTO_I {}

export interface UpdateSubAccountParamsDTO_I {
  id: number;
}

export interface UpdateSubAccountBodyDTO_I {
  accountId: number;
  email?: string;
  password?: string;
  name?: string;
  status?: boolean;
  permissions?: {
    create?: Partial<ModulesPermissions>;
    delete?: Partial<ModulesPermissions>;
    update?: Partial<ModulesPermissions>;
  };
}

export type UpdateSubAccountDTO_I = UpdateSubAccountParamsDTO_I &
  UpdateSubAccountBodyDTO_I;
