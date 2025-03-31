export interface DeleteReportLeadHumanServiceRepository_I {
  delete({
    userId,
    ticketId,
    id,
  }: {
    userId: number;
    ticketId: number;
    id: number;
  }): Promise<boolean>;
}
