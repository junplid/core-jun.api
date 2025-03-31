export interface PropsDeleteCampaignParameter {
  accountId: number;
  id: number;
}

export interface DeleteCampaignParameterRepository_I {
  delete(data: PropsDeleteCampaignParameter): Promise<void>;
  fetchExist(props: PropsDeleteCampaignParameter): Promise<number>;
}
