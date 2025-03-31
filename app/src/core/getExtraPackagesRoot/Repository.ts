import { TypeCycleExtraPackages, TypeExtraPackages } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface Result {
  id: number;
  status: boolean;
  name: string;
  type: TypeExtraPackages;
  newSubscribers: boolean;
  periodValidityStart: Date | null;
  periodValidityEnd: Date | null;
  cycle: TypeCycleExtraPackages;
  price: Decimal;
  createAt: Date;
  amount: number;
  plans: { id: number; name: string }[];
}

export interface GetExtraPackagesRootRepository_I {
  fetch(): Promise<Result[]>;
}
