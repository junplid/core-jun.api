export interface ResultGet {
  id: number;
  name: string;
}

export interface GetVariablesForSelectHumanServiceRepository_I {
  get(data: {
    userId: number;
    name?: string;
    ticketId?: number;
  }): Promise<ResultGet[]>;
}
