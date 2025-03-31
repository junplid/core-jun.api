export interface DeleteReportLeadHumanServiceParamsDTO_I {
  id: number;
  ticketId: number;
}

export interface DeleteReportLeadHumanServiceBodyDTO_I {
  userId: number;
}

export type DeleteReportLeadHumanServiceDTO_I =
  DeleteReportLeadHumanServiceParamsDTO_I &
    DeleteReportLeadHumanServiceBodyDTO_I;
