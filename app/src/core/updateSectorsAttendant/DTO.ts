export interface UpdateSectorsAttendantParamsDTO_I {
  id: number;
}

export interface UpdateSectorsAttendantQueryDTO_I {
  name?: string;
  office?: string;
  username?: string;
  password?: string;
  sectorsId?: number;
  accountId?: number;
  businessId?: number;
  status?: 0 | 1;
  previewTicketSector?: boolean;
  previewTicketBusiness?: boolean;
  allowInsertionAndRemovalOfTags?: boolean;
  allowToUseQuickMessages?: boolean;
  allowReOpeningATicket?: boolean;
  allowStartingNewTicket?: boolean;
  allowAddingNotesToLeadProfile?: boolean;
}

export interface UpdateSectorsAttendantBodyDTO_I {
  accountId: number;
}

export type UpdateSectorsAttendantDTO_I = UpdateSectorsAttendantParamsDTO_I &
  UpdateSectorsAttendantQueryDTO_I &
  UpdateSectorsAttendantBodyDTO_I;
