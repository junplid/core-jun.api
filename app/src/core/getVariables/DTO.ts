import { TypeVariable } from "@prisma/client";

export interface GetVariableBusinessQueryDTO_I {
  type?: TypeVariable;
  businessIds?: number[];
  name?: string;
}

export interface GetVariableBusinessBodyDTO_I {
  accountId: number;
}

export type GetVariableBusinessDTO_I = GetVariableBusinessBodyDTO_I &
  GetVariableBusinessQueryDTO_I;
