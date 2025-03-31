import { GetCheckPointsImplementation } from "./Implementation";
import { GetCheckPointsController } from "./Controller";
import { GetCheckPointsUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getCheckPointsImplementation = new GetCheckPointsImplementation(prisma);
const getCheckPointsUseCase = new GetCheckPointsUseCase(
  getCheckPointsImplementation
);

export const getCheckPointsController = GetCheckPointsController(
  getCheckPointsUseCase
).execute;
