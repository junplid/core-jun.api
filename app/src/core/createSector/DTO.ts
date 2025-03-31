import { TypeDistributionSectors, TypeTimeLackResponse } from "@prisma/client";

type operatingDays = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
type TypeBehavior =
  | "sendSector"
  | "sendAttendant"
  | "sendFlow"
  | "sendMessage"
  | "finish";

export interface CreateSectorDTO_I {
  accountId: number;
  name: string;
  status?: boolean;
  messageOutsideOfficeHours?: string;
  businessId: number;
  typeDistribution: TypeDistributionSectors;
  maximumService?: number;
  operatingDays?: operatingDays[];
  signBusiness?: boolean;
  signSector?: boolean;
  signAttendant?: boolean;
  timeToSendToAllSectors?: number;
  fromTime?: string;
  toTime?: string;
  supervisorsId?: number;
  addTag?: boolean;
  removeTicket?: boolean;
  previewPhone?: boolean;
  sectorsAttendantsIds?: number[];
  lackResponse?: {
    valueDuration: number;
    typeDuration: TypeTimeLackResponse;
    typeBehavior: TypeBehavior;
    sendAttendant?: number;
    sendSector?: number;
    sendFlow?: number;
    sendMessage?: string;
    finish?: boolean;
  };
  sectorsMessages: {
    messageWelcome?: string;
    messageWelcomeToOpenTicket?: string;
    messageFinishService?: string;
    messageTransferTicket?: string;
  };
  funnelKanbanId: number;
  allowedConnections?: number[];
}
