export interface ResultFetch {
  name: string;
  id: number;
}

export interface IFetch {
  sectorsId?: number;
  businessId: number;
}

export interface GetSectorsAttendantsForSelectHumanServiceRepository_I {
  fetch(props: IFetch): Promise<ResultFetch[]>;
  getAttendent(userId: number): Promise<{ businessId: number } | null>;
}
