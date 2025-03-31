export interface DeleteVariableContactHumanServiceRepository_I {
  fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null>;
  fetchExist(id: number): Promise<string | undefined>;
  fetchContactVariableBusinessId(props: {
    ticketId: number;
    variableId: number;
  }): Promise<number | undefined>;
  delete(props: { contactsVariableBusinessId: number }): Promise<void>;
}
