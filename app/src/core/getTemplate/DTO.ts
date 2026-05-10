export interface GetTemplateQueryDTO_I {
  fields: string;
}

export interface GetTemplateParamsDTO_I {
  id: number;
}

export interface GetTemplateBodyDTO_I {
  accountId: number;
}

export type GetTemplateDTO_I = GetTemplateBodyDTO_I &
  GetTemplateParamsDTO_I &
  GetTemplateQueryDTO_I;
