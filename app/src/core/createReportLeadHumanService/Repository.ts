import { TypeHumanServiceReportLead } from "@prisma/client";

export interface Props {
  type: TypeHumanServiceReportLead;
  value: string;
  userId: number;
  ticketId: number;
}

export interface CreateReportLeadHumanServiceRepository_I {
  create(props: Props): Promise<{ id: number; createAt: Date } | null>;
}
