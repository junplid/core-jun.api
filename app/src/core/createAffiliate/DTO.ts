import { AmountType, PixKeyType } from "@prisma/client";

export type CreateAffiliateDTO_I = {
  rootId: number;
  name: string;
  description?: string;
  status?: boolean;
  email: string;
  pixKey: string;
  number: string;
  birthDate?: string;
  cpfCnpj: string;
  incomeValue: number;
  address: string;
  addressNumber: string;
  province: string;
  postalCode: string;
  pixKeyType: PixKeyType;
  commissionType: AmountType;
  commissionValue: number;
  effectiveAfterDays?: number;
  couponId?: number;
};
