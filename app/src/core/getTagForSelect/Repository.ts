import { TypeTag } from "@prisma/client";

export interface ResultGet {
  id: number;
  name: string;
}

export interface GetTagForSelectRepository_I {
  get(data: {
    accountId: number;
    type?: TypeTag;
    businessIds: number[];
  }): Promise<ResultGet[]>;
}
