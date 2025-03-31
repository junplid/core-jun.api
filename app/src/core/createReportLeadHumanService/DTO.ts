import { TypeHumanServiceReportLead } from "@prisma/client";

export interface CreateReportLeadHumanServiceDTO_I {
  userId: number;
  type: TypeHumanServiceReportLead;
  value: string;
  ticketId: number;
}
