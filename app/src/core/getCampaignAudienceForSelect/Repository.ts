import { TypeAudience } from "@prisma/client";

export interface Props {
  accountId: number;
  businessIds?: number[];
  type?: TypeAudience[];
}

export interface GetCampaignAudienceForSelectRepository_I {
  fetch(props: Props): Promise<{ name: string; id: number }[]>;
}
