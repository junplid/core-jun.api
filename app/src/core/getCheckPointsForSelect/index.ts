import { GetCheckPointsForSelectImplementation } from "./Implementation";
import { GetCheckPointsForSelectController } from "./Controller";
import { GetCheckPointsForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCheckPointsForSelectImplementation =
  new GetCheckPointsForSelectImplementation(prisma);
const getCheckPointsForSelectUseCase = new GetCheckPointsForSelectUseCase(
  getCheckPointsForSelectImplementation
);

export const getCheckPointsForSelectController =
  GetCheckPointsForSelectController(getCheckPointsForSelectUseCase).execute;
