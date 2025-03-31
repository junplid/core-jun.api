import { TypeDestinationTicket } from "@prisma/client";

export type PropsFetch = {
  id: number;
  userId: number;
};

export interface ResultTicket {
  id: number;
  status: "new" | "open" | "resolved";
  attendantId?: number;
  destination: TypeDestinationTicket;
  destinationSectorsAttendantsId?: number;
  pendencies: number;
  connectionName: string;
  content: {
    protocol: string;
    contactName: string;
    contactNumber: string;
    contactImg: string;
    columnId: number;
    sectorName: string;
    businessName: string;
    countUnreadMsg: number;
    lastMsg?: { value: string; date: Date };
    tags: { id: number; name: string }[];
  };
  sectorId: number;
  businessId: number;
}

export interface GetTicketRepository_I {
  fetchInfoSectorAttendant(id: number): Promise<{
    previewTicketBusiness: boolean | null;
    previewTicketSector: boolean | null;
    sectorsId: number | null;
    businessId: number;
  } | null>;

  fetchTicket(props: PropsFetch): Promise<ResultTicket | null>;
  fetchSuperVisor(id: number): Promise<number>;
  fetchSectorsAttendants(id: number): Promise<number>;
}
