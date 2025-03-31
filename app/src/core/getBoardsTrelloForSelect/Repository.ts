export interface GetBoardsTrelloForSelectRepository_I {
  fetch(props: {
    key: string;
    token: string;
    memberId?: string;
  }): Promise<{ name: string; id: string }[]>;
  fetchIntegr(props: {
    accountId: number;
    integrationId: number;
  }): Promise<{ token: string; key: string } | null>;
}
