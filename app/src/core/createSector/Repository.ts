import { TypeDistributionSectors, TypeTimeLackResponse } from "@prisma/client";

type TypeBehavior =
  | "sendSector"
  | "sendAttendant"
  | "sendFlow"
  | "sendMessage"
  | "finish";

export interface PropsCreate {
  accountId: number;
  name: string;
  status?: boolean;
  businessId: number;
  messageOutsideOfficeHours?: string;
  typeDistribution: TypeDistributionSectors;
  maximumService?: number;
  operatingDays?: string;
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
export interface CreateReturn {
  readonly createAt: Date;
  readonly id: number;
  business: string;
  readonly countSectorsAttendants: number;
}

export interface CreateSectorRepository_I {
  create(data: PropsCreate): Promise<CreateReturn>;
  fetchExist(props: {
    name: string;
    accountId: number;
    businessId: number;
  }): Promise<number>;
}
