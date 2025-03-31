export interface Props {
  name: string;
  username: string;
  password: string;
  accountId: number;
  businessIds: number[];
  sectorIds?: number[];
}

export interface CreateSupervisorRepository_I {
  create(
    props: Props
  ): Promise<{ createAt: Date; id: number; business: string }>;
}
