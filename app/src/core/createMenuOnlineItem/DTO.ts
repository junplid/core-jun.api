import { TypeCategory } from "@prisma/client";

export interface CreateMenuOnlineItemParamsDTO_I {
  uuid: string;
}
export interface CreateMenuOnlineItemBodyDTO_I {
  accountId: number;
  name: string;
  desc?: string;
  fileNameImage: string;
  category: TypeCategory;
  beforePrice?: number;
  afterPrice: number;
  qnt?: number;
}
export type CreateMenuOnlineItemDTO_I = CreateMenuOnlineItemParamsDTO_I &
  CreateMenuOnlineItemBodyDTO_I;
