import { TypeCycleExtraPackages, TypeExtraPackages } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface Result {
  id: number;
  name: string;
  type: TypeExtraPackages;
  cycle: TypeCycleExtraPackages;
  price: Decimal;
  amount: number;
  newSubscribers: boolean;
  description: string | null;
  textOnPage: string | null;
}

export interface GetExtraPackageRepository_I {
  fetch(props: { accountId: number; id: number }): Promise<Result | null>;
}
