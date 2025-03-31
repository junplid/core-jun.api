import { TypeAudience } from "@prisma/client";

export interface GetCampaignAudienceForSelectQueryDTO_I {
  businessIds?: number[];
  type?: TypeAudience[];
}

export interface GetCampaignAudienceForSelectBodyDTO_I {
  accountId: number;
}

export type GetCampaignAudienceForSelectDTO_I =
  GetCampaignAudienceForSelectQueryDTO_I &
    GetCampaignAudienceForSelectBodyDTO_I;
