export interface CollectRouteOrderParamsDTO_I {
  code: string;
  n_order: string;
}

export interface CollectRouteOrderQueryDTO_I {
  nlid: string; // número do contato
}

export interface CollectRouteOrderBodyDTO_I {}

export type CollectRouteOrderDTO_I = CollectRouteOrderBodyDTO_I &
  CollectRouteOrderQueryDTO_I &
  CollectRouteOrderParamsDTO_I;
