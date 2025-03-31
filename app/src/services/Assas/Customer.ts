import { AxiosError } from "axios";
import { ApiAssas } from "./api";

interface PropsCreateCustomerAssas_I {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
  groupName?: string;
  company?: string;
}

interface ResultCreateCustomer_I {
  customerAssasId: string;
}

export async function createCustomerAssas(
  customer: PropsCreateCustomerAssas_I
): Promise<ResultCreateCustomer_I> {
  try {
    const { data } = await ApiAssas.post("/customers", customer);
    return {
      customerAssasId: data.id,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      console.log("Criar cliente", error.response?.status);
    }
    throw error;
  }
}

export async function updateCustomerAssas(
  customerId: string,
  fields: Partial<Pick<PropsCreateCustomerAssas_I, "name" | "cpfCnpj">>
): Promise<void> {
  try {
    await ApiAssas.put(`/customers/${customerId}`, fields);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      console.log("Atualizar cliente", error.response?.status);
    }
    throw error;
  }
}

interface Customer {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  postalCode: string;
  cpfCnpj: string;
  personType: string;
  deleted: boolean;
  additionalEmails: string;
  externalReference: string;
  notificationDisabled: boolean;
  city: number;
  state: string;
  country: string;
  observations: string;
}

export async function getCustomerAssas(customerId: string): Promise<Customer> {
  try {
    const { data } = await ApiAssas.get(`/customers/${customerId}`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log(error.response?.data);
      console.log("Criar cliente", error.response?.status);
    }
    throw error;
  }
}

type billingType = "BOLETO" | "PIX" | "CREDIT_CARD";

interface PropsCreateChargeAssas_I {
  // Identificador único do cliente no Asaas
  customer: string;
  billingType: billingType;
  value: number;
  // Data de vencimento da cobrança
  dueDate: Date;
  // Descrição da cobrança (máx. 500 caracteres)
  description?: string;
  externalReference?: string;
  // Número de parcelas (somente no caso de cobrança parcelada)
  installmentCount?: number;
  // Valor de cada parcela (somente no caso de cobrança parcelada)
  installmentValue?: number;
  postalService: boolean;
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
    addressNumber: string;
    addressComplement: string;
    phone: string;
    mobilePhone?: string;
  };
  // Token do cartão de crédito para uso da funcionalidade de tokenização de cartão de crédito
  creditCardToken?: string;
  // Realizar apenas a Pré-Autorização da cobrança
  authorizeOnly?: boolean;
  remoteIp: string;
}

export async function createCobrançaAssas(
  customer: PropsCreateChargeAssas_I
): Promise<ResultCreateCustomer_I> {
  try {
    const { data } = await ApiAssas.post("/payments", customer);
    return {
      customerAssasId: data.id,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("Criar cobrança", error.response?.status);
    }
    throw error;
  }
}
