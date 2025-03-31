export interface DeleteDocumentContactAccountFileRepository_I {
  deleteD(id: number): Promise<{ name: string | undefined }>;
}
