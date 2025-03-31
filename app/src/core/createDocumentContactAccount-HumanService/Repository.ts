export interface PropsCreate {
  name: string;
  type: string;
  contactAccountId: number;
}

export interface CreateDocumentContactAccountFileRepository_I {
  create(data: PropsCreate): Promise<{
    readonly id: number;
  }>;
  fetchContactAccount(ticketId: number): Promise<number | undefined>;
}
