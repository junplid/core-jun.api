export interface CloneEmailServiceConfigurationParamsDTO_I {
  id: number;
}

export interface CloneEmailServiceConfigurationBodyDTO_I {
  accountId: number;
}

export type CloneEmailServiceConfigurationDTO_I =
  CloneEmailServiceConfigurationParamsDTO_I &
    CloneEmailServiceConfigurationBodyDTO_I;
