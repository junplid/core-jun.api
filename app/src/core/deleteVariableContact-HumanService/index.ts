import { DeleteVariableContactHumanServiceImplementation } from "./Implementation";
import { DeleteVariableContactHumanServiceController } from "./Controller";
import { DeleteVariableContactHumanServiceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteVariableContactHumanServiceImplementation =
  new DeleteVariableContactHumanServiceImplementation(prisma);
const deleteVariableContactHumanServiceUseCase =
  new DeleteVariableContactHumanServiceUseCase(
    deleteVariableContactHumanServiceImplementation
  );

export const deleteVariableContactHumanServiceController =
  DeleteVariableContactHumanServiceController(
    deleteVariableContactHumanServiceUseCase
  ).execute;
