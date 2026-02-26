export interface GetAgentTemplateQueryDTO_I {
  fields: string;
}

export interface GetAgentTemplateParamsDTO_I {
  id: number;
}

export interface GetAgentTemplateBodyDTO_I {
  accountId: number;
}

export type GetAgentTemplateDTO_I = GetAgentTemplateBodyDTO_I &
  GetAgentTemplateParamsDTO_I &
  GetAgentTemplateQueryDTO_I;
