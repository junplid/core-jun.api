import { TypeVariable } from "@prisma/client";

export interface GetVariableForSelectQueryDTO_I {
  type?: TypeVariable[];
  name?: string;
}

export interface GetVariableForSelectParamsDTO_I {
  businessIds: number[];
}

export interface GetVariableForSelectBodyDTO_I {
  accountId: number;
}

export type GetVariableForSelectDTO_I = GetVariableForSelectBodyDTO_I &
  GetVariableForSelectParamsDTO_I &
  GetVariableForSelectQueryDTO_I;
