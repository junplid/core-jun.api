export interface CreateTemplateDTO_I {
  accountId: number;
  modalHash: string;
  templatedId: number;
  fields: Record<string, Record<string, number | string | number[] | string[]>>;
}
