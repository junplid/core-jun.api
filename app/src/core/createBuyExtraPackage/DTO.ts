export type CreateBuyExtraPackageDTO_I = {
  accountId: number;
  extraPackageId: number;
  coupon?: string;
} & (
  | { billingType: "PIX" }
  | {
      billingType: "CREDIT_CARD";
      creditCardId: number;
      remoteIp: string;
    }
);
