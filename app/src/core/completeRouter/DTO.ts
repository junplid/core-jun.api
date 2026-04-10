export interface CompleteRouterParamsDTO_I {
  code: string;
}

export interface CompleteRouterQueryDTO_I {
  nlid: string; // número do contato
}

export interface CompleteRouterBodyDTO_I {}

export type CompleteRouterDTO_I = CompleteRouterBodyDTO_I &
  CompleteRouterQueryDTO_I &
  CompleteRouterParamsDTO_I;
