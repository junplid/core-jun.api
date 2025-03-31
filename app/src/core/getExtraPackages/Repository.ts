import { TypeCycleExtraPackages, TypeExtraPackages } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface Result {
  id: number;
  name: string;
  type: TypeExtraPackages;
  periodValidityStart: Date | null;
  periodValidityEnd: Date | null;
  cycle: TypeCycleExtraPackages;
  price: Decimal;
  amount: number;
  createAt: Date;
  newSubscribers: boolean;
}

export interface GetExtraPackagesRepository_I {
  fetch(props: { accountId: number }): Promise<Result[]>;
}
