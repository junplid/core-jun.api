export interface CreateInsertLeadOnDemandAudienceQueryDTO_I {
  id: number;
  name: string;
  number: string;
  tags?: string[];
  variables?: { [x: string]: string };
}
export interface CreateInsertLeadOnDemandAudienceBodyDTO_I {
  accountId: number;
}

export type CreateInsertLeadOnDemandAudienceDTO_I =
  CreateInsertLeadOnDemandAudienceBodyDTO_I &
    CreateInsertLeadOnDemandAudienceQueryDTO_I;
