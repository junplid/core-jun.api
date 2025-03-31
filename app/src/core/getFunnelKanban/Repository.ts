import { TypeDestinationTicket, TypeStatusTicket } from "@prisma/client";

export type ResultGet = {
  id: number;
  columns: {
    rows: {
      ticket: {
        id: number;
        status: TypeStatusTicket;
        destination: TypeDestinationTicket;
        attendant: { id: number; name: string; office: string | null };
        hasPendencie: boolean;
        content: {
          color?: string;
          protocol: string;
          contactName: string;
          contactImg: string;
          contactNumber: string;
          sectorName: string;
          businessName: string;
          countUnreadMsg: number;
          lastMsg?: { value: string; date: Date };
        };
      };
      sequence: number;
    }[];
    id: number;
    name: string;
    sequence: number;
    color: string;
  }[];
};

export interface GetFunnelKanbanRepository_I {
  get(data: { userId: number; sectorId: number }): Promise<ResultGet | null>;
}
