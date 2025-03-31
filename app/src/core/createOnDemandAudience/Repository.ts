export interface PropsCreate {
  name: string;
  businessIds: number[];
  accountId: number;
  tagOnBusinessId?: number[];
}

export interface PropsFetchExist {
  name: string;
  accountId: number;
  businessIds: number[];
}

export interface Result {
  id: number;
  business: string;
  createAt: Date;
  tags: string;
  countContacts: number;
}

export interface CreateOnDemandAudienceRepository_I {
  create(props: PropsCreate): Promise<Result>;
  fetchExist(props: PropsFetchExist): Promise<number>;
}
