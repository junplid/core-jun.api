export interface GetListsOnBoardTrelloForSelectParamsDTO_I {
  id: number;
  boardId: string;
}

export interface GetListsOnBoardTrelloForSelectBodyDTO_I {
  accountId: number;
}

export type GetListsOnBoardTrelloForSelectDTO_I =
  GetListsOnBoardTrelloForSelectParamsDTO_I &
    GetListsOnBoardTrelloForSelectBodyDTO_I;
