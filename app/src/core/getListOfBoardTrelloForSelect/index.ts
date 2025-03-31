import { prisma } from "../../adapters/Prisma/client";
import { GetListOfBoardTrelloForSelectController } from "./Controller";
import { GetListOfBoardTrelloForSelectImplementation } from "./Implementation";
import { GetListOfBoardTrelloForSelectUseCase } from "./UseCase";

const getListOfBoardTrelloForSelectImplementation =
  new GetListOfBoardTrelloForSelectImplementation(prisma);
const getListOfBoardTrelloForSelectUseCase =
  new GetListOfBoardTrelloForSelectUseCase(
    getListOfBoardTrelloForSelectImplementation
  );

export const getListOfBoardTrelloForSelectController =
  GetListOfBoardTrelloForSelectController(
    getListOfBoardTrelloForSelectUseCase
  ).execute;
