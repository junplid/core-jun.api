export interface Props {
  accountId: number;
  businessIds?: number[];
  status?: boolean;
}

export interface GetChabotsForSelectRepository_I {
  fetch(props: Props): Promise<
    {
      name: string;
      id: number;
      connectionOnBusinessId: number | null;
      status: boolean | null;
    }[]
  >;
}
