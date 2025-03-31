import { TypeDestinationTicket, TypeStatusTicket } from "@prisma/client";

export type PropsFetch = (
  | { user: "supervisor" }
  | {
      user: "sectorsAttendants";
      previewPhone: boolean;
      previewTicketBusiness: boolean | null;
      previewTicketSector: boolean | null;
      businessId: number;
      sectorsId: number;
    }
) & {
  userId: number;
  filter?: "unread" | "all" | "serving" | "new" | "pending" | "resolved";
  deleted?: boolean;
  search?: string;
  tags?: number[];
};

export interface ResultTicket {
  id: number;
  status: "new" | "open" | "resolved";
  attendantId?: number;
  pendencies: number;
  content: {
    contactName: string;
    contactImg: string;
    sectorName: string;
    businessName: string;
    countUnreadMsg: number;
    lastMsg?: { value: string; date: Date };
  };
}

export interface GetTicketsRepository_I {
  fetchInfoSectorAttendant(id: number): Promise<{
    previewTicketBusiness: boolean | null;
    previewTicketSector: boolean | null;
    businessId: number;
    Sectors: { previewPhone: boolean; id: number } | null;
  } | null>;
  fetchTickets(props: PropsFetch): Promise<ResultTicket[]>;
  fetchSuperVisor(id: number): Promise<number>;
  fetchSectorsAttendants(id: number): Promise<number>;
}
