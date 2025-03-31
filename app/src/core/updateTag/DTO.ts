import { TypeTag } from "@prisma/client";

export interface UpdateTagParamsDTO_I {
  id: number;
}

export interface UpdateTagQueryDTO_I {
  name?: string;
  type?: TypeTag;
  businessIds?: number[];
}

export interface UpdateTagBodyDTO_I {
  accountId: number;
}

export type UpdateTagDTO_I = UpdateTagBodyDTO_I &
  UpdateTagParamsDTO_I &
  UpdateTagQueryDTO_I;
