import { AxiosError } from "axios";
import { ApiAssas } from "./api";

export type BillingType_T = "BOLETO" | "PIX" | "CREDIT_CARD";

type PropsCreatePaymentAssas_I = {
  customer: string;
  description?: string;
  value: number;
  dueDate: Date;
  installmentCount?: number;
  installmentValue?: number;
  postalService?: boolean;
  authorizeOnly?: boolean;
  externalReference?: string;
} & (
  | {
      billingType: "PIX";
    }
  | {
      billingType: "CREDIT_CARD";
      creditCard: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
      };
    }
);

interface ResponseAsaasCreatePayment {
  object: "payment";
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: any;
  dueDate: string;
  value: number;
  netValue: number;
  billingType: BillingType_T;
  canBePaidAfterDueDate: boolean;
  pixTransaction: any;
  status: "PENDING";
  description: string;
  externalReference: string;
  originalValue: any;
  interestValue: any;
  originalDueDate: string;
  paymentDate: any;
  clientPaymentDate: any;
  installmentNumber: number;
  transactionReceiptUrl: any;
  nossoNumero: "6453";
  invoiceUrl: "https://www.asaas.com/i/080225913252";
  bankSlipUrl: "https://www.asaas.com/b/pdf/080225913252";
  invoiceNumber: "00005101";
  discount: {
    value: number;
    dueDateLimitDays: number;
  };
  fine: {
    value: number;
  };
  interest: {
    value: number;
  };
  deleted: boolean;
  postalService: boolean;
  anticipated: boolean;
  anticipable: boolean;
  refunds: any;
}

export async function AsaasCreatePayment({
  authorizeOnly = false,
  installmentCount = 0,
  installmentValue = 0,
  postalService = false,
  ...rest
}: PropsCreatePaymentAssas_I): Promise<ResponseAsaasCreatePayment> {
  try {
    const { data } = await ApiAssas.post("/payments", {
      ...rest,
      authorizeOnly,
      installmentCount,
      installmentValue,
      postalService,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("payment", error.response?.status);
      console.log(error.response?.data);
    }
    throw error;
  }
}

interface PropsAsaasGetQRCodePixOfPayment_I {
  id: string;
}

interface ResponseGetQRCodePix {
  encodedImage: string;
  payload: string;
  expirationDate: string;
  success: boolean;
}

export async function AsaasGetQRCodePixOfPayment({
  id,
}: PropsAsaasGetQRCodePixOfPayment_I): Promise<ResponseGetQRCodePix> {
  try {
    const { data } = await ApiAssas.get(`/payments/${id}/pixQrCode`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("payment", error.response?.status);
      console.log(error.response?.data);
    }
    throw error;
  }
}

interface ICreateCreditCard {
  customer: string;
  remoteIp: string;
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    phone?: string;
    addressNumber: string;
    addressComplement?: string | null;
    mobilePhone: string | null;
  };
}

export async function AsaasCreateCreditCardToken(
  fields: ICreateCreditCard
): Promise<{
  creditCardNumber: string;
  creditCardBrand:
    | "VISA"
    | "MASTERCARD"
    | "ELO"
    | "DINERS"
    | "DISCOVER"
    | "AMEX"
    | "HIPERCARD"
    | "CABAL"
    | "BANESCARD"
    | "CREDZ"
    | "SOROCRED"
    | "CREDSYSTEM"
    | "JCB"
    | "UNKNOWN";
  creditCardToken: string;
}> {
  try {
    const { phone, ...creditCardHolderInfo } = fields.creditCardHolderInfo;
    const { data } = await ApiAssas.post(`/creditCard/tokenize`, {
      ...fields,
      creditCardHolderInfo,
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        throw error.response?.data.errors;
      }
    }
    throw error;
  }
}

// buscar pelas cobranças do periodo pagas, se vir vaziu significa que não pagou então vai ficar inadimplemtne

type StatusPayment =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

interface PropsGetPayments {
  limit?: number;
  offset?: number;
  customer?: string;
  status?: StatusPayment;
  subscription?: string;
  externalReference?: string;
  paymentDate?: string;
  "dateCreated[ge]"?: string;
  "dateCreated[le]"?: string;
  "paymentDate[ge]"?: string;
  "paymentDate[le]"?: string;
  "estimatedCreditDate[ge]"?: string;
  "estimatedCreditDate[le]"?: string;
  "dueDate[ge]"?: string;
  "dueDate[le]"?: string;
}

export async function AsaasGetPayments(query: PropsGetPayments): Promise<any> {
  try {
    const queryUrl = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      queryUrl.set(key, String(value));
    }
    const { data } = await ApiAssas.get(`/payments?${queryUrl}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("payment", error.response?.status);
      console.log(error.response?.data);
    }
    throw error;
  }
}
