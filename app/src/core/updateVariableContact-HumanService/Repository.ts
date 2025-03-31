export interface UpdateVariableContactHumanServiceRepository_I {
  fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null>;
  fetchExist(id: number): Promise<string | undefined>;
  fetchContactAccount(ticketId: number): Promise<number | undefined>;
  updateContactAccountVariableBusiness(props: {
    id: number;
    contactAccountId: number;
    value: string;
  }): Promise<void>;
}
