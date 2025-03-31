export interface ResultFetch {
  name: string;
  id: number;
}

export interface GetConnectionsSectorForSelectRepository_I {
  fetch(data: { userId: number }): Promise<ResultFetch[]>;
}
