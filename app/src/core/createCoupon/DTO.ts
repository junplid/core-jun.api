import { AmountType } from "@prisma/client";

export type CreateCouponDTO_I = {
  rootId: number;
  name: string;
  description?: string;
  status?: boolean;
  activationCode: string;
  discountType: AmountType;
  discountValue: number;
  validFrom?: Date;
  validUntil?: Date;
  maxQuantity?: number;
  isValidOnRenewal?: boolean;
  applicableTo?: ("PLANS" | "EXTRAS")[];
  plansIds?: number[];
  extrasIds?: number[];
};
