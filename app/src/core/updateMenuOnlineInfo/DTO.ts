import { TypePaymentMethods } from "@prisma/client";

export interface UpdateMenuOnlineInfoBodyDTO_I {
  accountId: number;
  delivery_fee: number | undefined; // base_fee
  address: string | null;
  state_uf: string | null;
  city: string | null;
  phone_contact: string | null;
  whatsapp_contact: string | null;
  lat?: number;
  lng?: number;
  payment_methods: TypePaymentMethods[];
  max_distance_km?: number;
  price_per_km?: number;
}

export interface UpdateMenuOnlineInfoParamsDTO_I {
  uuid: string;
}

export type UpdateMenuOnlineInfoDTO_I = UpdateMenuOnlineInfoParamsDTO_I &
  UpdateMenuOnlineInfoBodyDTO_I;
