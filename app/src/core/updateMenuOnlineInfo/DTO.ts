import { TypePaymentMethods } from "@prisma/client";

export interface UpdateMenuOnlineInfoBodyDTO_I {
  accountId: number;
  delivery_fee: number | undefined;
  address: string | null;
  state_uf: string | null;
  city: string | null;
  phone_contact: string | null;
  whatsapp_contact: string | null;
  payment_methods: TypePaymentMethods[];
}

export interface UpdateMenuOnlineInfoParamsDTO_I {
  uuid: string;
}

export type UpdateMenuOnlineInfoDTO_I = UpdateMenuOnlineInfoParamsDTO_I &
  UpdateMenuOnlineInfoBodyDTO_I;
