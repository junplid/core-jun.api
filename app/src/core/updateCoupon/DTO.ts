import { AmountType, PixKeyType } from "@prisma/client";

export type UpdateCouponBodyDTO_I = {
  name?: string;
  description?: string;
  status?: boolean;
  activationCode?: string;
  discountType?: AmountType;
  discountValue?: number;
  validFrom?: Date;
  validUntil?: Date;
  maxQuantity?: number;
  isValidOnRenewal?: boolean;
  applicableTo?: ("PLANs" | "EXTRAS")[];
  plansIds?: number[];
  extrasIds?: number[];
  rootId: number;
};

export type UpdateCouponParamsDTO_I = {
  id: number;
};

export type UpdateCouponDTO_I = UpdateCouponParamsDTO_I & UpdateCouponBodyDTO_I;
