export interface UpdatePlanParamsDTO_I {
  id: number;
}

export interface UpdatePlanQueryDTO_I {
  acceptsNewUsers?: "0" | "1";
  activeFoSubscribers?: "0" | "1";
  allowsRenewal?: "0" | "1";
}

export interface UpdatePlanBodyDTO_I {
  rootId: number;
}

export type UpdatePlanDTO_I = UpdatePlanBodyDTO_I &
  UpdatePlanParamsDTO_I &
  UpdatePlanQueryDTO_I;
