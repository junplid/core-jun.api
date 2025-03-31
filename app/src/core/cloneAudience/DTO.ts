export interface CloneAudienceParamsDTO_I {
  id: number;
}

export interface CloneAudienceBodyDTO_I {
  accountId: number;
}

export type CloneAudienceDTO_I = CloneAudienceParamsDTO_I &
  CloneAudienceBodyDTO_I;
