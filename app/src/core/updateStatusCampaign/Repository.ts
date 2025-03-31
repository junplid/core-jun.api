import { TypeStatusCampaign } from "@prisma/client";

export interface UpdateStatusCampaignRepository_I {
  fetch(props: { id: number; accountId: number }): Promise<number>;
  update(props: {
    id: number;
    accountId: number;
    status: TypeStatusCampaign;
  }): Promise<void>;
}
