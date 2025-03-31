export interface PropsFetchExist {
  accountId: number;
  id: number;
}

export interface DeleteCampaignAudienceRepository_I {
  delete(props: PropsFetchExist): Promise<void>;
  fetchExist(props: PropsFetchExist): Promise<number>;
}
