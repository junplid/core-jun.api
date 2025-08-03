export interface CreateMenuOnlineOrderParamsDTO_I {
  uuid: string;
}

export interface CreateMenuOnlineOrderBodyDTO_I {
  delivery_complement?: string;
  delivery_cep?: string;
  delivery_address?: string;
  who_receives?: string;
  payment_method?: string;
  items: {
    qnt: number;
    obs?: string;
    flavors?: { qnt: number; id: string }[];
    type: "pizza" | "drink";
    id: string;
  }[];
}

export type CreateMenuOnlineOrderDTO_I = CreateMenuOnlineOrderParamsDTO_I &
  CreateMenuOnlineOrderBodyDTO_I;
