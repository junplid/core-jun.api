import { AmountType, PixKeyType } from "@prisma/client";

export type UpdateAffiliateBodyDTO_I = {
  rootId: number;
  walletId?: string;
  name?: string;
  description?: string;
  status?: number;
  email?: string;
  pixKey?: string;
  number?: string;
  pixKeyType?: PixKeyType;
  commissionType?: AmountType;
  commissionValue?: number;
  effectiveAfterDays?: number;
  couponId?: number;
};

export type UpdateAffiliateParamsDTO_I = {
  id: number;
};

export type UpdateAffiliateDTO_I = UpdateAffiliateParamsDTO_I &
  UpdateAffiliateBodyDTO_I;
