import { TypeTag } from "@prisma/client";

export interface GetTagForSelectQueryDTO_I {
  type?: TypeTag;
  businessIds?: number[];
  name?: string;
}

export interface GetTagForSelectBodyDTO_I {
  accountId: number;
}

export type GetTagForSelectDTO_I = GetTagForSelectQueryDTO_I &
  GetTagForSelectBodyDTO_I;
