import { TypeHumanServiceReportLead } from "@prisma/client";

export interface GetReportLeadHumanServiceQueryDTO_I {
  type?: TypeHumanServiceReportLead[];
}

export interface GetReportLeadHumanServiceParamsDTO_I {
  ticketId: number;
}

export interface GetReportLeadHumanServiceBodyDTO_I {
  userId: number;
}

export type GetReportLeadHumanServiceDTO_I =
  GetReportLeadHumanServiceQueryDTO_I &
    GetReportLeadHumanServiceBodyDTO_I &
    GetReportLeadHumanServiceParamsDTO_I;
