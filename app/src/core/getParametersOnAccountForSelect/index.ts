import { GetParametersOnAccountForSelectImplementation } from "./Implementation";
import { GetParametersOnAccountForSelectController } from "./Controller";
import { GetParametersOnAccountForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getParametersOnAccountForSelectImplementation =
  new GetParametersOnAccountForSelectImplementation(prisma);
const getParametersOnAccountForSelectUseCase =
  new GetParametersOnAccountForSelectUseCase(
    getParametersOnAccountForSelectImplementation
  );

export const getParametersOnAccountForSelectController =
  GetParametersOnAccountForSelectController(
    getParametersOnAccountForSelectUseCase
  ).execute;
