import { prisma } from "../../adapters/Prisma/client";
import { GetVariableForSelectController } from "./Controller";
import { GetVariableForSelectImplementation } from "./Implementation";
import { GetVariableForSelectUseCase } from "./UseCase";

const getVariableForSelectImplementation =
  new GetVariableForSelectImplementation(prisma);
const getVariableForSelectUseCase = new GetVariableForSelectUseCase(
  getVariableForSelectImplementation
);

export const getVariableForSelectController = GetVariableForSelectController(
  getVariableForSelectUseCase
).execute;
