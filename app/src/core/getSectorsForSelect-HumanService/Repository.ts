export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetSectorsForSelectHumanServiceRepository_I {
  fetchAttendant(userId: number): Promise<{ businessId: number } | null>;
  fetch(businessId: number): Promise<ResultFetch[]>;
}
