export interface DeleteEmailServiceConfigurationParamsDTO_I {
  id: number;
}

export interface DeleteEmailServiceConfigurationBodyDTO_I {
  accountId: number;
}

export type DeleteEmailServiceConfigurationDTO_I =
  DeleteEmailServiceConfigurationParamsDTO_I &
    DeleteEmailServiceConfigurationBodyDTO_I;
