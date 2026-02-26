export interface TestAgentTemplateDTO_I {
  content: string; // mensagem
  accountId: number;
  providerCredentialId?: number;
  apiKey?: string;
  token_modal_chat_template: string;
  templatedId: number;
  fields: Record<string, Record<string, number | string | number[] | string[]>>;
}
