import { TypeTag } from "@prisma/client";

export interface GetTagForSelectQueryDTO_I {
  type?: TypeTag;
}
export interface GetTagForSelectParamsDTO_I {
  businessIds: number[];
}

export interface GetTagForSelectBodyDTO_I {
  accountId: number;
}

export type GetTagForSelectDTO_I = GetTagForSelectQueryDTO_I &
  GetTagForSelectBodyDTO_I &
  GetTagForSelectParamsDTO_I;
