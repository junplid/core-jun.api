import { PlanAssets, TypeExtraPackages } from "@prisma/client";

export interface PropsFetchPlan_I {
  id: number;
}

export type PropsUpdateExtraAssetData_I = {
  accountId: number;
  type: TypeExtraPackages;
  amount: number;
};

export interface AsaasWebHookChargesRepository_I {
  updatePlanAccount(props: {
    accountId: number;
    planId: number;
  }): Promise<void>;
  getExtraP(props: {
    id: number;
  }): Promise<{ type: TypeExtraPackages; amount: number } | null>;
}
