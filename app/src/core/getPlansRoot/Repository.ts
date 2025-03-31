import { Plan, PlanAssets, PlanPeriods } from "@prisma/client";

export interface Plan_I extends Plan {
  PlanAssets: PlanAssets | null;
  PlanPeriods: PlanPeriods[];
}

export interface GetPlansRootRepository_I {
  fetch(): Promise<Plan_I[]>;
}
