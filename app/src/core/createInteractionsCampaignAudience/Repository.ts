export interface PropsCreate {
  name: string;
  businessIds: number[];
  tagOnBusinessId?: number[];
  contacts: {
    contactWAOnAccountId: number;
  }[];
  accountId: number;
}

export interface PropsFetch {
  accountId: number;
  sources?: {
    business?: number[];
    campaigns?: number[];
    audiences?: number[];
  };
  filters?: {
    tagsContacts?: number[];
    variables?: {
      possibleValues: string[];
      id: number;
    }[];
  };
}

export interface Result {
  id: number;
  business: string;
  createAt: Date;
  tags: string;
  countContacts: number;
}

export interface CreateInteractionsCampaignAudienceRepository_I {
  create(props: PropsCreate): Promise<Result>;
  fetch(props: PropsFetch): Promise<{ contactWAOnAccountId: number }[]>;
}
