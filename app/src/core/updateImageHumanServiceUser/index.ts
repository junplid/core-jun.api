import { prisma } from "../../adapters/Prisma/client";
import { CreateImageHumanServiceUserController } from "./Controller";
import { CreateImageHumanServiceUserImplementation } from "./Implementation";
import { CreateImageHumanServiceUserUseCase } from "./UseCase";

const createImageHumanServiceUser =
  new CreateImageHumanServiceUserImplementation(prisma);
const createImageHumanServiceUserUseCase =
  new CreateImageHumanServiceUserUseCase(createImageHumanServiceUser);

export const createImageHumanServiceUserController =
  CreateImageHumanServiceUserController(
    createImageHumanServiceUserUseCase
  ).execute;
