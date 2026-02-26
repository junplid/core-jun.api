export interface CreateAgentTemplateDTO_I {
  accountId: number;
  providerCredentialId?: number;
  apiKey?: string;
  nameProvider?: string;
  modalHash: string;
  templatedId: number;
  fields: Record<string, Record<string, number | string | number[] | string[]>>;
}
