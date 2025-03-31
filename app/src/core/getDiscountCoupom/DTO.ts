export type GetDiscountCoupomParamsDTO_I = {
  code: string;
};

export type GetDiscountCoupomQueryDTO_I = {
  planId?: number;
  extraId?: number;
};

export type GetDiscountCoupomBodyDTO_I = {
  accountId?: number;
};

export type GetDiscountCoupomDTO_I = GetDiscountCoupomParamsDTO_I &
  GetDiscountCoupomBodyDTO_I &
  GetDiscountCoupomQueryDTO_I;
