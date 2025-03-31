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

export interface CreateAggregationCampaignAudienceRepository_I {
  fetch(props: PropsFetch): Promise<number>;
}
