import { TypeSentBy } from "@prisma/client";

export type PropsFetch =
  | {
      user: "supervisor";
      userId: number;
      filter: "unread" | "serving" | "new" | "pending" | "resolved";
    }
  | {
      filter: "unread" | "serving" | "new" | "pending" | "resolved";
      user: "sectorsAttendants";
      userId: number;
      previewTicketBusiness: boolean | null;
      previewTicketSector: boolean | null;
    };

export interface ResultTicket {
  protocol: string;
  id: number;
  businessName: string;
  contactName: string;
  sectorName: string;
}

export interface GetTicketMessagesRepository_I {
  fetchMessagesOfTicket(
    userId: number,
    ticketId: number,
    isRead?: boolean
  ): Promise<{
    leadName: string;
    businessId: number;
    conversation: {
      id: number;
      createAt: Date;
      type: string;
      sentBy: TypeSentBy;
      read: boolean;
      message: string;
      fullName: string;
      number: string;
      org?: string;
    }[];
  } | null>;
  fetchAttendantOfTicket(userId: number, ticketId: number): Promise<number>;
}
