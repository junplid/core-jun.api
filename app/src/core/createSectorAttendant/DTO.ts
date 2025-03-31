export interface CreateSectorAttendantDTO_I {
  name: string;
  office: string;
  username: string;
  password: string;
  sectorsId?: number;
  accountId: number;
  businessId: number;
  status: 0 | 1;
  previewTicketSector?: boolean;
  previewTicketBusiness?: boolean;
  allowInsertionAndRemovalOfTags?: boolean;
  allowToUseQuickMessages?: boolean;
  allowReOpeningATicket?: boolean;
  allowStartingNewTicket?: boolean;
  allowAddingNotesToLeadProfile?: boolean;
}
