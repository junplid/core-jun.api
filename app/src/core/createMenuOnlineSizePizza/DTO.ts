export interface CreateMenuOnlineSizePizzaParamsDTO_I {
  uuid: string;
}

export interface CreateMenuOnlineSizePizzaBodyDTO_I {
  accountId: number;
  name: string;
  price: number;
  flavors: number;
  slices?: number;
}

export type CreateMenuOnlineSizePizzaDTO_I =
  CreateMenuOnlineSizePizzaParamsDTO_I & CreateMenuOnlineSizePizzaBodyDTO_I;
