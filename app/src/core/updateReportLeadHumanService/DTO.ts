import { TypeHumanServiceReportLead } from "@prisma/client";

export interface UpdateReportLeadHumanServiceBodyDTO_I {
  userId: number;
  value: string;
}

export interface UpdateReportLeadHumanServiceParamsDTO_I {
  type: TypeHumanServiceReportLead;
  id: number;
}

export type UpdateReportLeadHumanServiceDTO_I =
  UpdateReportLeadHumanServiceBodyDTO_I &
    UpdateReportLeadHumanServiceParamsDTO_I;
