export interface CloneIntegrationParamsDTO_I {
  id: number;
}

export interface CloneIntegrationBodyDTO_I {
  accountId: number;
}

export type CloneIntegrationDTO_I = CloneIntegrationParamsDTO_I &
  CloneIntegrationBodyDTO_I;
