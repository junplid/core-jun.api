export interface GetHumanServiceUserRepository_I {
  findSectorsAttendants(props: { userId: number }): Promise<{
    id: number;
    office: string;
    name: string;
    username: string;
    imageName: string | null;
    previewTicketBusiness: boolean;
    previewTicketSector: boolean;
    allowAddingNotesToLeadProfile: boolean;
    allowInsertionAndRemovalOfTags: boolean;
    allowReOpeningATicket: boolean;
    allowStartingNewTicket: boolean;
    allowToUseQuickMessages: boolean;
    sector?: {
      id: number;
      previewPhone: boolean;
      removeTicket: boolean;
      addTag: boolean;
      name: string;
      business: string;
      businessId: number;
    };
  } | null>;
  findSupervisors(props: { userId: number }): Promise<{
    id: number;
    name: string;
    imageName: string | null;
    username: string;
    sector: {
      id: number;
      name: string;
      business: string;
      businessId: number;
      previewPhone: boolean;
      removeTicket: boolean;
      addTag: boolean;
    }[];
  } | null>;
}
