export interface DeleteTagContactHumanServiceRepository_I {
  fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null>;
  fetchExist(id: number): Promise<boolean>;
  fetchContactTagBusinessId(props: {
    ticketId: number;
    tagId: number;
  }): Promise<number | undefined>;
  delete(props: { contactsTagBusinessId: number }): Promise<void>;
}
