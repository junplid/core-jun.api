export interface CreateInteractionsCampaignAudienceDTO_I {
  name: string;
  businessIds: number[];
  accountId: number;
  tagOnBusinessId?: number[];
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
