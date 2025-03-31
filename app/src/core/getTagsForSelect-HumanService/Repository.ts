export interface ResultGet {
  id: number;
  name: string;
}

export interface GetTagsForSelectHumanServiceRepository_I {
  get(data: { userId: number }): Promise<ResultGet[]>;
}
