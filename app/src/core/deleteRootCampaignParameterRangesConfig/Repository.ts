export interface DeleteRootCampaignParameterRangesConfigRepository_I {
  del(props: { id: number }): Promise<void>;
  isAlreadyExists(props: { id: number }): Promise<number>;
}
