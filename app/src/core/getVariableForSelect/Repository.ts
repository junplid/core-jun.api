import { TypeVariable } from "@prisma/client";

export interface ResultGet {
  id: number;
  name: string;
}

export interface GetVariableForSelectRepository_I {
  get(data: {
    accountId: number;
    type?: TypeVariable[];
    name?: string;
    businessIds: number[];
  }): Promise<ResultGet[]>;
}
