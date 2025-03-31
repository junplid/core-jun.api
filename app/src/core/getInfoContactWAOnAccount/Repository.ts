import { TypeAudience, TypeStatusCampaign } from "@prisma/client";

export interface ResultFetch {
  name: string;
  updateAt: Date;
  id: number;
  ddd: string;
  idd: string;
  localNumber: string;
  completeNumber: string;
  checkPoints: { createAt: Date; id: number; name: string }[];
  tags: { id: number; name: string }[];
  variables: { name: string; id: number; value: string }[];
  audiences: {
    campaigns: {
      flow: {
        name: string | undefined;
        id: number;
      };
      id: number;
      name: string;
      status: TypeStatusCampaign;
      isSent: boolean | null;
      isFinish: boolean | null;
    }[];
    id: number;
    name: string;
    type: TypeAudience;
  }[];
}

export interface GetContactWAOnAccountRepository_I {
  fetchContactWAOnAccount(props: {
    accountId: number;
    id: number;
  }): Promise<ResultFetch[]>;
  // fetchConnectionRoot(): Promise<number[]>;
}
