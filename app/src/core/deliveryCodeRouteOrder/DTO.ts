export interface DeliveryCodeRouteOrderParamsDTO_I {
  code: string;
  delivery_code: string;
}

export interface DeliveryCodeRouteOrderQueryDTO_I {
  nlid: string; // número do contato
}

export interface DeliveryCodeRouteOrderBodyDTO_I {}

export type DeliveryCodeRouteOrderDTO_I = DeliveryCodeRouteOrderBodyDTO_I &
  DeliveryCodeRouteOrderQueryDTO_I &
  DeliveryCodeRouteOrderParamsDTO_I;
