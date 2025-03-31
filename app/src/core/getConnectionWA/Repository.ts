import { TypeConnetion } from "@prisma/client";

export interface IConn {
  name: string;
  type: TypeConnetion;
  id: number;
  createAt: Date;
  countShots: number;
  updateAt: Date;
  number: string | null;
  Chatbot: { name: string }[];
  _count: { Tickets: number };
  ConnectionOnCampaign: {
    CampaignOnBusiness: {
      Campaign: {
        status: string;
        isOndemand: boolean;
        name: string;
        id: number;
      };
    };
  }[];
  Business: { name: string };
}

export interface GetConnectionWARepository_I {
  fetch(connWAId: number): Promise<IConn | null>;
}
