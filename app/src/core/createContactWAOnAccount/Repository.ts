export interface PropsCreateContactsWAAndContactsOnAccount {
  name: string;
  accountId: number;
  completeNumber: string;
}

export interface PropsConnectTagOnBusinessToContactsWAOnAccount {
  contactsWAOnAccountId: number;
  tagOnBusinessId: number;
}

export interface PropsConnectContactsWAExistingToNewContactsOnAccount {
  name: string;
  accountId: number;
  contactWAId: number;
}

export interface PropsConnectVariablesOnBusinessToContactsWAOnAccount {
  value: string;
  variableOnBusinessId: number;
  contactsWAOnAccountId: number;
}

export interface CreateContactWAOnAccountRepository_I {
  fetchExistingContactsWA(props: {
    completeNumber: string;
  }): Promise<{ contactsWAId: number } | null>;
  connectContactsWAExistingToNewContactsOnAccount(
    data: PropsConnectContactsWAExistingToNewContactsOnAccount
  ): Promise<{ contactsWAOnAccountId: number }>;
  createContactsWAAndContactsOnAccount(
    props: PropsCreateContactsWAAndContactsOnAccount
  ): Promise<{ contactsWAOnAccountId: number }>;
  fetchExistingTagOnBusiness(where: {
    name: string;
    accountId: number;
    businessIds: number[];
  }): Promise<{
    tagOnBusinessId: number;
  } | null>;
  fetchExistingVariablesOnBusiness(props: {
    name: string;
    accountId: number;
  }): Promise<{
    variableId: number;
  } | null>;
  connectTagOnBusinessToContactsWAOnAccount(
    data: PropsConnectTagOnBusinessToContactsWAOnAccount
  ): Promise<void>;
  connectVariableOnBusinessToContactsWAOnAccount(
    data: PropsConnectVariablesOnBusinessToContactsWAOnAccount
  ): Promise<void>;
  createTagOnBusiness(props: {
    name: string;
    businessIds: number[];
    accountId: number;
  }): Promise<{ tagOnBusinessIds: number[] }>;
  createTagOnBusinessOnContactWAOnAccount(props: {
    contactsWAOnAccountId: number;
    tagOnBusinessId: number;
  }): Promise<void>;
  createVariableOnBusiness(props: {
    name: string;
    businessIds: number[];
    accountId: number;
  }): Promise<{ variableOnBusinessIds: number[] }>;
  createContactsWAOnAccountVariablesOnBusiness(data: {
    value: string;
    variableOnBusinessId: number;
    contactsWAOnAccountId: number;
  }): Promise<void>;
}
