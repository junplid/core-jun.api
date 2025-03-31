import { TypeAudience } from "@prisma/client";

export interface GetAudienceOnAccountForSelectBodyDTO_I {
  accountId: number;
}

export interface GetAudienceOnAccountForSelectQueryDTO_I {
  businessIds?: number[];
  type?: TypeAudience;
}

export type GetAudienceOnAccountForSelectDTO_I =
  GetAudienceOnAccountForSelectBodyDTO_I &
    GetAudienceOnAccountForSelectQueryDTO_I;
