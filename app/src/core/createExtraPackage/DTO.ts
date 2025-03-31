import { TypeCycleExtraPackages, TypeExtraPackages } from "@prisma/client";

export interface CreateExtraPackageDTO_I {
  rootId: number;
  type: TypeExtraPackages;
  name: string;
  status?: boolean;
  newSubscribers?: boolean;
  description?: string;
  amount: number;
  textOnPage?: string;
  periodValidityStart?: Date;
  periodValidityEnd?: Date;
  cycle: TypeCycleExtraPackages;
  price: number;
  planIds?: number[];
}
