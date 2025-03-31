import { AxiosError } from "axios";
import { ApiAssas } from "./api";
import { StatusChargeAsaas_T } from "./types";

export type EventAsaasNotifications_T =
  | "PAYMENT_RECEIVED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DUEDATE_WARNING"
  | "PAYMENT_DUEDATE_WARNING"
  | "PAYMENT_CREATED"
  | "PAYMENT_UPDATED"
  | "SEND_LINHA_DIGITAVEL"
  | "PAYMENT_OVERDUE";

type CycleSubscription =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

type BillingType = "PIX" | "CREDIT_CARD";
type StatusSubscription = "ACTIVE" | "EXPIRED" | "INACTIVE";

type PropsCreateSubscriptionsAssas_I = {
  customer: string;
  nextDueDate: string;
  value: number;
  description?: string;
  maxPayments?: number;
  externalReference?: string;
  split?: {
    walletId: string;
    fixedValue?: number | null;
    percentualValue?: number | null;
  }[];
  cycle: CycleSubscription;
} & (
  | { billingType: "PIX" }
  | {
      billingType: "CREDIT_CARD";
      remoteIp: string;
      creditCardToken: string;
    }
);

export async function createAsaasSubscriptions(
  body: PropsCreateSubscriptionsAssas_I
): Promise<{ id: string }> {
  try {
    const { data } = await ApiAssas.post("/subscriptions", body);
    return { id: data.id };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw error;
  }
}

type PropsGetSubscriptionsAssas_I = {
  customer?: string;
  deletedOnly?: boolean;
  includeDeleted?: boolean;
  externalReference?: string;
  order?: string;
  sort?: string;
  offset?: number;
  limit?: number;
  status?: StatusSubscription;
  billingType?: BillingType;
  customerGroupName?: string;
};

export interface ResultGetSubscriptions {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string | null;
  value: number;
  nextDueDate: string;
  cycle: CycleSubscription;
  description: string | null;
  billingType: BillingType;
  deleted: boolean;
  status: StatusSubscription;
  externalReference: string;
  creditCard: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  };
  sendPaymentByPostalService: false;
  fine: { value: number; type: string };
  interest: { value: number; type: string };
  split: null | [];
}

export async function getAsaasSubscriptions(
  props: PropsGetSubscriptionsAssas_I
): Promise<ResultGetSubscriptions[]> {
  try {
    const queryUrl = new URLSearchParams();

    for (const [key, value] of Object.entries(props)) {
      queryUrl.set(key, String(value));
    }
    const { data } = await ApiAssas.get(`/subscriptions?${queryUrl}`);
    return data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw error;
  }
}

type PropsGetSubscriptionChargesAssas_I = {
  id: string;
  status?: StatusChargeAsaas_T;
};

interface ResponseSubscriptionCharges {
  data: {
    object: string;
    id: string;
    dateCreated: string;
    customer: string;
    paymentLink?: any;
    value: 200;
    netValue: 195;
    originalValue?: any;
    interestValue?: any;
    description?: any;
    billingType: "BOLETO";
    canBePaidAfterDueDate: boolean;
    status: "PENDING";
    dueDate: string;
    originalDueDate: string;
    paymentDate?: any;
    clientPaymentDate?: any;
    installmentNumber?: any;
    invoiceUrl: string;
    invoiceNumber: string;
    externalReference?: any;
    deleted: boolean;
    bankSlipUrl: string;
    postalService: boolean;
    anticipated: boolean;
    anticipable: boolean;
  };
}

export async function getAsaasSubscriptionCharges(
  props: PropsGetSubscriptionChargesAssas_I
): Promise<ResponseSubscriptionCharges> {
  try {
    const queryUrl = new URLSearchParams();
    if (props.status) queryUrl.set("status", props.status);
    const { data } = await ApiAssas.get(
      `/subscriptions/${props.id}/payments?${queryUrl}`
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw error;
  }
}

interface ResponseSubscription {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: any;
  billingType:
    | "UNDEFINED"
    | "BOLETO "
    | "CREDIT_CARD "
    | "DEBIT_CARD "
    | "TRANSFER "
    | "DEPOSIT "
    | "PIX";
  cycle:
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "BIMONTHLY"
    | "QUARTERLY"
    | "SEMIANNUALLY"
    | "YEARLY";
  value: number;
  nextDueDate: string;
  endDate: string;
  description?: string;
  deleted: boolean;
  externalReference?: any;
  maxPayments: number;
  status?: "ACTIVE" | "EXPIRED" | "INACTIVE";
}
type PropsGetSubscriptionAssas_I = {
  id: string;
};

export async function getAsaasSubscription(
  props: PropsGetSubscriptionAssas_I
): Promise<ResponseSubscription> {
  try {
    const { data } = await ApiAssas.get(`/subscriptions/${props.id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw error;
  }
}

interface ResponseUpdateSubscription {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: any;
  billingType:
    | "UNDEFINED"
    | "BOLETO "
    | "CREDIT_CARD "
    | "DEBIT_CARD "
    | "TRANSFER "
    | "DEPOSIT "
    | "PIX";
  cycle:
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "BIMONTHLY"
    | "QUARTERLY"
    | "SEMIANNUALLY"
    | "YEARLY";
  value: number;
  nextDueDate: string;
  endDate: string;
  description?: string;
  deleted: boolean;
  externalReference?: any;
  maxPayments: number;
  status?: "ACTIVE" | "EXPIRED" | "INACTIVE";
}

export async function updateAsaasSubscription(
  id: string,
  body: Partial<PropsCreateSubscriptionsAssas_I & {}> & {
    status?: "ACTIVE" | "EXPIRED" | "INACTIVE";
  }
): Promise<ResponseUpdateSubscription> {
  try {
    const { data } = await ApiAssas.put(`/subscriptions/${id}`, body);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw error;
  }
}

interface ResponseDeleteSubscription {
  id: string;
  deleted: boolean;
}

export async function deleteAsaasSubscription(
  id: string
): Promise<ResponseDeleteSubscription> {
  try {
    const { data } = await ApiAssas.delete(`/subscriptions/${id}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
    }
    throw error;
  }
}
