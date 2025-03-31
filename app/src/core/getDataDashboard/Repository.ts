export interface Result {
  connectionsWA: number[];
  campaigns: number;
  chatbots: number[];
  leadsPerPeriod: {
    createAt: Date;
    value: number;
  }[];
  shotsPerPeriod: {
    createAt: Date;
    value: number;
  }[];
  // disparos que faltam - total de disparos do mês
}

export interface GetDataDashboardRepository_I {
  fetch(props: { accountId: number }): Promise<Result | null>;
}
