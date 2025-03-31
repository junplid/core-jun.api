import { prisma } from "../../adapters/Prisma/client";
import { UpdatePasswordHumanServiceController } from "./Controller";
import { UpdatePasswordHumanServiceImplementation } from "./Implementation";
import { UpdatePasswordHumanServiceUseCase } from "./UseCase";

const updatePasswordHumanServiceImplementation =
  new UpdatePasswordHumanServiceImplementation(prisma);
const updatePasswordHumanServiceUseCase = new UpdatePasswordHumanServiceUseCase(
  updatePasswordHumanServiceImplementation
);

export const updatePasswordHumanServiceController =
  UpdatePasswordHumanServiceController(
    updatePasswordHumanServiceUseCase
  ).execute;
