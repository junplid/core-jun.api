import { PlanAssets, TypeCyclePlanPeriods, TypePlan } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreatePlanDTO_I {
  rootId: number;
  name: string;
  description: string;
  type: TypePlan;
  isDefault: boolean;
  free_trial_time: number | null;
  label: string | null;
  acceptsNewUsers?: boolean;
  activeFoSubscribers?: boolean;
  allowsRenewal?: boolean;
  PlanPeriods?: {
    label: string | null;
    cycle: TypeCyclePlanPeriods;
    amount: number;
    price_after_renovation: Decimal | null;
    price: Decimal;
  }[];
  PlanAssets: Omit<PlanAssets, "id">;
}
