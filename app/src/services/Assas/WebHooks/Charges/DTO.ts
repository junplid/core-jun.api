import { TypeCycleExtraPackages } from "@prisma/client";
import { BillingType_T } from "../../Payments";
import {
  BillingEventsAsaas_T,
  StatusChargeAsaas_T,
  SubscriptionEventsAsaas_T,
} from "../../types";

export interface AsaasWebHookChargesQueryDTO_I {
  isOndemand?: number;
}

export interface AsaasWebHookChargesBodyDTO_I {
  accountId: number;
}

export type AsaasWebHookChargesDTO_I =
  | {
      id: string;
      event: BillingEventsAsaas_T;
      dateCreated: Date;
      payment: {
        object: "payment";
        subscription: string;
        id: string;
        dateCreated: string;
        customer: string;
        value: number;
        netValue: number;
        billingType: BillingType_T;
        status: StatusChargeAsaas_T;
        deleted: boolean;
        anticipated: boolean;
        anticipable: boolean;
        creditDate: Date | null;
        estimatedCreditDate: Date | null;
        paymentDate: Date | null;
        clientPaymentDate: Date | null;
        pixTransaction: string | null;
        dueDate: string;
        externalReference: {
          periodId?: number;
          extraId?: number;
          couponId?: number;
        } | null;
      };
    }
  | {
      id: string;
      event: SubscriptionEventsAsaas_T;
      dateCreated: Date;
      subscription: {
        object: "subscription";
        id: string;
        dateCreated: Date;
        customer: string;
        paymentLink: null | string;
        value: number;
        nextDueDate: Date;
        cycle: TypeCycleExtraPackages;
        description: string | null;
        billingType: BillingType_T;
        deleted: boolean;
        status: "ACTIVE" | "INACTIVE";
        externalReference: {
          periodId?: number;
          extraId?: number;
          couponId?: number;
        } | null;
        sendPaymentByPostalService: boolean;
        discount?: {
          value: number;
          limitDate: null;
          dueDateLimitDays: number;
          type: string;
        };
        fine?: { value: number; type: string };
        interest?: { value: number; type: string };
        split?: {
          walletId: string;
          fixedValue: any;
          percentualValue: number;
          externalReference: string;
          description: string | null;
        }[];
        creditCard?: {
          creditCardNumber: string;
          creditCardBrand: string;
          creditCardToken: string;
        };
      };
    };
