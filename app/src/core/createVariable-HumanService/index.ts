import { CreateVariableHumanServiceImplementation } from "./Implementation";
import { CreateVariableHumanServiceController } from "./Controller";
import { CreateVariableHumanServiceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createVariableHumanServiceImplementation =
  new CreateVariableHumanServiceImplementation(prisma);
const createVariableHumanServiceUseCase = new CreateVariableHumanServiceUseCase(
  createVariableHumanServiceImplementation
);

export const createVariableHumanServiceController =
  CreateVariableHumanServiceController(
    createVariableHumanServiceUseCase
  ).execute;
