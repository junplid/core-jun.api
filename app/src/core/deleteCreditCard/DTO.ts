export type DeleteCreditCardParamsDTO_I = {
  id: number;
};
export type DeleteCreditCardBodyDTO_I = {
  accountId: number;
};

export type DeleteCreditCardDTO_I = DeleteCreditCardParamsDTO_I &
  DeleteCreditCardBodyDTO_I;
