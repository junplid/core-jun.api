import { TypeExtraPackages } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface UpdateExtraPackageParamsDTO_I {
  id: number;
}

export interface UpdateExtraPackageBodyDTO_I {
  name?: string;
  type?: TypeExtraPackages;
  status?: boolean;
  newSubscribers?: boolean;
  description?: string;
  amount: number;
  textOnPage?: string;
  periodValidityStart?: Date;
  periodValidityEnd?: Date;
  cycleDays?: number;
  price?: Decimal | number;
}

export type UpdateExtraPackageDTO_I = UpdateExtraPackageBodyDTO_I &
  UpdateExtraPackageParamsDTO_I;
