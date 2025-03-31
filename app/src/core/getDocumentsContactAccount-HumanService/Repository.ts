export interface GetDocumentContactAccountFileRepository_I {
  fetch(
    contactAccountId: number
  ): Promise<{ id: number; name: string; type: string }[]>;
  fetchContactAccount(ticketId: number): Promise<number | undefined>;
}
