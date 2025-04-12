import { TypeVariable } from "@prisma/client";

export interface GetVariableForSelectQueryDTO_I {
  type?: TypeVariable[];
  name?: string;
  businessIds?: number[];
}

export interface GetVariableForSelectBodyDTO_I {
  accountId: number;
}

export type GetVariableForSelectDTO_I = GetVariableForSelectBodyDTO_I &
  GetVariableForSelectQueryDTO_I;
