export interface GetBoardsTrelloForSelectParamsDTO_I {
  id: number;
}

export interface GetBoardsTrelloForSelectBodyDTO_I {
  accountId: number;
}

export type GetBoardsTrelloForSelectDTO_I =
  GetBoardsTrelloForSelectParamsDTO_I & GetBoardsTrelloForSelectBodyDTO_I;
