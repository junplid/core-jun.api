import { UpdateVariableContactHumanServiceImplementation } from "./Implementation";
import { UpdateVariableContactHumanServiceController } from "./Controller";
import { UpdateVariableContactHumanServiceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const updateVariableContactHumanServiceImplementation =
  new UpdateVariableContactHumanServiceImplementation(prisma);
const updateVariableContactHumanServiceUseCase =
  new UpdateVariableContactHumanServiceUseCase(
    updateVariableContactHumanServiceImplementation
  );

export const updateVariableContactHumanServiceController =
  UpdateVariableContactHumanServiceController(
    updateVariableContactHumanServiceUseCase
  ).execute;
