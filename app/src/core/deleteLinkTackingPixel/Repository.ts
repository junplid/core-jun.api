export interface Props {
  accountId: number;
  id: number;
}

export interface DeleteLinkTackingPixelRepository_I {
  delete(props: Props): Promise<void>;
}
