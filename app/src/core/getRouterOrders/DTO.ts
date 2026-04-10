export interface GetRouterOrdersParamsDTO_I {
  code: string;
}

export interface GetRouterOrdersQueryDTO_I {
  nlid: string; // número do contato
}

export interface GetRouterOrdersBodyDTO_I {}

export type GetRouterOrdersDTO_I = GetRouterOrdersBodyDTO_I &
  GetRouterOrdersQueryDTO_I &
  GetRouterOrdersParamsDTO_I;
