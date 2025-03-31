export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteEmailServiceConfigurationRepository_I {
  delete(props: Props): Promise<void>;
}
