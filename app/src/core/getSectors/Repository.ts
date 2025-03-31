export interface Result {
  id: number;
  name: string;
  createAt: Date;
  countSectorsAttendants: number;
  business: string;
  status: boolean;
}

export interface Props {
  accountId: number;
}

export interface GetSectorsRepository_I {
  fetch(props: Props): Promise<Result[]>;
}
