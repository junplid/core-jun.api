export interface CreateIntegrationRepository_I {
  fetchExist(props: {
    accountId: number;
    key: string;
    token: string;
    type: "trello";
  }): Promise<number>;
  create(props: {
    accountId: number;
    key: string;
    token: string;
    type: "trello";
  }): Promise<{ id: number; createAt: Date }>;
}
