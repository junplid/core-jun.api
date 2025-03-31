import { TypeActivation } from "@prisma/client";

export interface GetChabotsQueryDTO_I {
  type?: TypeActivation[];
}

export interface GetChabotsBodyDTO_I {
  accountId: number;
}

export type GetChabotsDTO_I = GetChabotsBodyDTO_I & GetChabotsQueryDTO_I;
