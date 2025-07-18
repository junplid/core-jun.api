import { GetListsOnBoardTrelloForSelectController } from "./Controller";
import { GetListsOnBoardTrelloForSelectUseCase } from "./UseCase";

export const getListsOnBoardTrelloForSelectController =
  GetListsOnBoardTrelloForSelectController(
    new GetListsOnBoardTrelloForSelectUseCase()
  ).execute;
