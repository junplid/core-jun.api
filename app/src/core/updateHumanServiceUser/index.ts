import { prisma } from "../../adapters/Prisma/client";
import { UpdateHumanServiceUserController } from "./Controller";
import { UpdateHumanServiceUserImplementation } from "./Implementation";
import { UpdateHumanServiceUserUseCase } from "./UseCase";

const updateHumanServiceUserImplementation =
  new UpdateHumanServiceUserImplementation(prisma);
const updateHumanServiceUserUseCase = new UpdateHumanServiceUserUseCase(
  updateHumanServiceUserImplementation
);

export const updateHumanServiceUserController =
  UpdateHumanServiceUserController(updateHumanServiceUserUseCase).execute;
