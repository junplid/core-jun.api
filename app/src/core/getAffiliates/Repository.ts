import { AmountType, PixKeyType } from "@prisma/client";

export interface IResult {
  id: number;
  name: string;
  status: boolean;
  walletId: string;
  reference: string;
  email: string;
  createAt: Date;
  Coupon: { id: number; name: string; activationCode: string } | null;
  ContactWA: { completeNumber: string };
  commissionType: AmountType;
  commissionValue: number;
  description: string | null;
  effectiveAfterDays: number | null;
  pixKey: string;
  pixKeyType: PixKeyType;
}

export interface GetAffiliatesRepository_I {
  fetch(): Promise<IResult[]>;
}
