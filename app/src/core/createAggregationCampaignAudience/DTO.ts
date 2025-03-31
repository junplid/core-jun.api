export interface CreateAggregationCampaignAudienceDTO_I {
  accountId: number;
  sources?: {
    business?: number[];
    campaigns?: number[];
    audience?: number[];
  };
  filters?: {
    tagsContacts?: number[];
    variables?: {
      id: number;
      possibleValues: string[];
    }[];
  };
}
