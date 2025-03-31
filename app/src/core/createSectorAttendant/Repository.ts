export interface Props {
  accountId: number;
  username: string;
}

export interface PropsCreate {
  name: string;
  office: string;
  username: string;
  password: string;
  status: boolean;
  previewTicketSector?: boolean;
  previewTicketBusiness?: boolean;
  allowInsertionAndRemovalOfTags?: boolean;
  allowToUseQuickMessages?: boolean;
  allowReOpeningATicket?: boolean;
  allowStartingNewTicket?: boolean;
  allowAddingNotesToLeadProfile?: boolean;
  sectorsId?: number;
  accountId: number;
  businessId: number;
}

export interface ResultCreateAttendant {
  createAt: Date;
  id: number;
  business: string;
  sectorName: string;
}

export interface CreateSectorAttendantRepository_I {
  fetchAlreadyExists(props: Props): Promise<number>;
  create(props: PropsCreate): Promise<ResultCreateAttendant>;
}
