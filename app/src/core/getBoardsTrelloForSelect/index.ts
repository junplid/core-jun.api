import { prisma } from "../../adapters/Prisma/client";
import { GetBoardsTrelloForSelectController } from "./Controller";
import { GetBoardsTrelloForSelectImplementation } from "./Implementation";
import { GetBoardsTrelloForSelectUseCase } from "./UseCase";

const getBoardsTrelloForSelectImplementation =
  new GetBoardsTrelloForSelectImplementation(prisma);
const getBoardsTrelloForSelectUseCase = new GetBoardsTrelloForSelectUseCase(
  getBoardsTrelloForSelectImplementation
);

export const getBoardsTrelloForSelectController =
  GetBoardsTrelloForSelectController(getBoardsTrelloForSelectUseCase).execute;
