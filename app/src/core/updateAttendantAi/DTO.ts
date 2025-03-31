export interface UpdateAttendantAiDTO_I {
  id: number;
  accountId: number;
  description?: string;
  name?: string;
  businessIds?: number[];
  aiId?: number;
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
