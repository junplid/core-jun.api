import { AxiosError } from "axios";
import { ApiAssas } from "./api";

export type EventAsaasNotifications_T =
  | "PAYMENT_RECEIVED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DUEDATE_WARNING"
  | "PAYMENT_DUEDATE_WARNING"
  | "PAYMENT_CREATED"
  | "PAYMENT_UPDATED"
  | "SEND_LINHA_DIGITAVEL"
  | "PAYMENT_OVERDUE";

interface NotificationAssas_I {
  id: string;
  enabled: boolean;
  emailEnabledForProvider: boolean;
  smsEnabledForProvider: boolean;
  emailEnabledForCustomer: boolean;
  smsEnabledForCustomer: boolean;
  phoneCallEnabledForCustomer: boolean;
  whatsappEnabledForCustomer: boolean;
  scheduleOffset?: "0" | "5" | "10" | "15";
}

interface PropsCreateCustomerAssas_I {
  // Id do cliente
  cutomer: string;
  notifications: NotificationAssas_I[];
}

export async function updateAsaasClientNotification(
  body: PropsCreateCustomerAssas_I
): Promise<void> {
  try {
    await ApiAssas.post("https://sandbox.asaas.com/api/v3", body);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("atualizar", error.response?.status);
      console.log(error.response);
    }
    throw error;
  }
}

interface PropsGetAsaasClientNotifications_I {
  cutomerId: string;
}

interface ResultGetAsaasClientNotifications_I extends NotificationAssas_I {
  deleted: boolean;
  enable: boolean;
  object: string;
  customer: string;
  event: EventAsaasNotifications_T;
}

export async function getAsaasClientNotifications(
  props: PropsGetAsaasClientNotifications_I
): Promise<ResultGetAsaasClientNotifications_I[]> {
  try {
    const { data } = await ApiAssas.get(
      `/customers/${props.cutomerId}/notifications`
    );
    return data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.log("get notificações", error.response?.status);
    }
    throw error;
  }
}
