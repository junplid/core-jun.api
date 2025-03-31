export type GetSubscriptionsADMQueryDTO_I = {
  all?: boolean;
};

export type GetSubscriptionsADMBodyDTO_I = {
  accountId: number;
};

export type GetSubscriptionsADMDTO_I = GetSubscriptionsADMQueryDTO_I &
  GetSubscriptionsADMBodyDTO_I;
