export interface GetBoardsTrelloForSelectQueryDTO_I {
  memberId?: string;
}

export interface GetBoardsTrelloForSelectParamsDTO_I {
  integrationId: number;
}

export interface GetBoardsTrelloForSelectBodyDTO_I {
  accountId: number;
}

export type GetBoardsTrelloForSelectDTO_I = GetBoardsTrelloForSelectQueryDTO_I &
  GetBoardsTrelloForSelectBodyDTO_I &
  GetBoardsTrelloForSelectParamsDTO_I;
