export interface Props {
  accountId: number;
  businessIds?: number[];
}

export interface GetCheckPointsForSelectRepository_I {
  fetch(props: Props): Promise<{ name: string; id: number }[]>;
}
