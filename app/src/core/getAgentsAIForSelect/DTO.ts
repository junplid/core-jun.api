import { TypeVariable } from "@prisma/client";

export interface GetAgentsAIForSelectQueryDTO_I {
  type?: TypeVariable[];
  name?: string;
  businessIds?: number[];
}

export interface GetAgentsAIForSelectBodyDTO_I {
  accountId: number;
}

export type GetAgentsAIForSelectDTO_I = GetAgentsAIForSelectBodyDTO_I &
  GetAgentsAIForSelectQueryDTO_I;
