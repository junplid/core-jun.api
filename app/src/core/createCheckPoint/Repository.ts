export interface Props {
  accountId: number;
  businessIds: number[];
  name: string;
}

export interface CreateCheckPointRepository_I {
  fetchAlreadyExists(props: Props): Promise<number>;
  create(
    props: Props
  ): Promise<{ createAt: Date; id: number; business: string }>;
}
