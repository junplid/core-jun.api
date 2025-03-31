export interface CreateTagContactHumanServiceRepository_I {
  fetchAttendantExist(props: {
    userId: number;
  }): Promise<{ businessId: number; accountId: number } | null>;
  fetchTagOnBusinessId(props: { id: number; businessId: number }): Promise<
    | {
        tagBusinessId: number;
        tagName: string;
      }
    | undefined
  >;
  fetchContactAccount(ticketId: number): Promise<number | undefined>;
  addTagOnContactAccount(props: {
    contactAccountId: number;
    tagBusinessId: number;
  }): Promise<void>;
  existTagOnContactAccount(props: {
    contactAccountId: number;
    tagBusinessId: number;
  }): Promise<boolean>;
}
