import { Audience } from "@prisma/client";

export type CampaignAudience_I = Audience & {
  TagOnBusinessOnAudience: {
    TagOnBusiness: {
      Tag: {
        name: string;
      };
    };
  }[];
  AudienceOnBusiness: {
    Business: {
      name: string;
    };
  }[];
  _count: {
    ContactsWAOnAccountOnAudience: number;
  };
};

export interface GetCampaignAudiencesRepository_I {
  get(data: { accountId: number }): Promise<CampaignAudience_I[]>;
}
