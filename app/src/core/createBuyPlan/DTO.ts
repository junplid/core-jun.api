export type CreateBuyPlanDTO_I = {
  planId: number;
  coupon?: string;
  periodId?: number;
  accountId: number;
} & (
  | { billingType: "PIX" }
  | {
      billingType: "CREDIT_CARD";
      creditCardId: number;
      remoteIp: string;
    }
);
