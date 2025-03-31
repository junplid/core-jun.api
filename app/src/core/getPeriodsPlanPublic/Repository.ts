import { PlanPeriods } from "@prisma/client";

export interface GetPeriodsPlanPublicRepository_I {
  fetch({ planId }: { planId: number }): Promise<PlanPeriods[]>;
}
