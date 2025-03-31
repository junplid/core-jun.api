import { TypeHumanServiceReportLead } from "@prisma/client";

export interface Props {
  userId: number;
  type?: TypeHumanServiceReportLead[];
  ticketId: number;
}

export interface GetReportLeadHumanServiceRepository_I {
  fetch(props: Props): Promise<
    | {
        humanServiceOnBusinessOnContactsWAOnAccountId: number;
        createAt: Date;
        id: number;
        value: string;
        type: TypeHumanServiceReportLead;
      }[]
    | null
  >;
}
