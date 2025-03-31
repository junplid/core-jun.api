export interface PropsCreate {
  name: string;
  contactsWAOnAccountIds: number[];
  businessId: number[];
  accountId: number;
  tagOnBusinessId?: number[];
}

export interface PropsFetchExist {
  name: string;
  accountId: number;
  businessId: number[];
}

export interface PropsCheckContactsWA {
  contactsWAOnAccountId: number;
  accountId: number;
}

export interface Result {
  id: number;
  business: string;
  createAt: Date;
  tags: string;
  countContacts: number;
}

export interface CreateImportCampaignAudienceRepository_I {
  create(props: PropsCreate): Promise<Result>;
  fetchExist(props: PropsFetchExist): Promise<number>;
  checkIfContactWAIsContactWAOnAccount(
    props: PropsCheckContactsWA
  ): Promise<number>;
}
