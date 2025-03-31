export interface UpdateEmailServiceConfigurationParamsDTO_I {
  id: number;
}

export interface UpdateEmailServiceConfigurationQueryDTO_I {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
  businessIds?: number[];
}

export interface UpdateEmailServiceConfigurationBodyDTO_I {
  accountId: number;
}

export type UpdateEmailServiceConfigurationDTO_I =
  UpdateEmailServiceConfigurationBodyDTO_I &
    UpdateEmailServiceConfigurationParamsDTO_I &
    UpdateEmailServiceConfigurationQueryDTO_I;
