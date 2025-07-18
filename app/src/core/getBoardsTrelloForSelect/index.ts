import { GetBoardsTrelloForSelectController } from "./Controller";
import { GetBoardsTrelloForSelectUseCase } from "./UseCase";

export const getBoardsTrelloForSelectController =
  GetBoardsTrelloForSelectController(
    new GetBoardsTrelloForSelectUseCase()
  ).execute;
