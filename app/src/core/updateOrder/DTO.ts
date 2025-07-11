export interface UpdateOrderParamsDTO_I {
  id: number;
}

export interface UpdateOrderQueryDTO_I {
  name?: string;
  businessId?: number;
  pixel_id?: string;
  access_token?: string;
}

export interface UpdateOrderBodyDTO_I {
  accountId: number;
}

export type UpdateOrderDTO_I = UpdateOrderBodyDTO_I &
  UpdateOrderParamsDTO_I &
  UpdateOrderQueryDTO_I;
