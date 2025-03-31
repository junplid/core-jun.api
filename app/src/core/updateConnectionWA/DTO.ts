import { TypeConnetion } from "@prisma/client";

export interface UpdateConnectionWABodyDTO_I {
  accountId: number;
}

export interface UpdateConnectionWAParamsDTO_I {
  id: number;
}

export interface UpdateConnectionWAQueryDTO_I {
  name?: string;
  type?: TypeConnetion;
  businessId?: number;
}

export type UpdateConnectionWADTO_I = UpdateConnectionWAParamsDTO_I &
  UpdateConnectionWABodyDTO_I &
  UpdateConnectionWAQueryDTO_I;
