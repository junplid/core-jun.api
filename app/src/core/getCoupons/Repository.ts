import { AmountType, ApplicableTo, PixKeyType } from "@prisma/client";

export interface IResult {
  id: number;
  name: string;
  status: boolean;
  createAt: Date;
  description: string | null;
  activationCode: string;
  applicableTo: string | null;
  discountType: AmountType;
  discountValue: number;
  maxQuantity: number;
  quantityUsed: number;
  isValidOnRenewal: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  ApplicableCoupons: {
    planId: number | null;
    extraPackageId: number | null;
    type: ApplicableTo;
  }[];
  _count: {
    Affiliates: number;
    ApplicableCoupons: number;
  };
}

export interface GetCouponsRepository_I {
  fetch(): Promise<IResult[]>;
}
