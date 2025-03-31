export interface GetListOfBoardTrelloForSelectParamsDTO_I {
  integrationId: number;
  boardId: string;
}

export interface GetListOfBoardTrelloForSelectBodyDTO_I {
  accountId: number;
}

export type GetListOfBoardTrelloForSelectDTO_I =
  GetListOfBoardTrelloForSelectBodyDTO_I &
    GetListOfBoardTrelloForSelectParamsDTO_I;
