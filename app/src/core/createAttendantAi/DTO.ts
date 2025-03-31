export interface CreateAttendantAiDTO_I {
  name: string;
  businessIds: number[];
  accountId: number;
  aiId: number;
  description?: string;
  briefing?: string;
  personality?: string;
  role?: string;
  definitions?: string;
  knowledgeBase?: string;
  files?: {
    filename: string;
    originalname: string;
  }[];
}
