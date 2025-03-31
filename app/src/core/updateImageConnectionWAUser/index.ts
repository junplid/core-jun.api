import { prisma } from "../../adapters/Prisma/client";
import { CreateImageConnectionUserController } from "./Controller";
import { CreateImageConnectionUserImplementation } from "./Implementation";
import { CreateImageConnectionUserUseCase } from "./UseCase";

const createImageConnectionUser = new CreateImageConnectionUserImplementation(
  prisma
);
const createImageConnectionUserUseCase = new CreateImageConnectionUserUseCase(
  createImageConnectionUser
);

export const createImageConnectionUserController =
  CreateImageConnectionUserController(createImageConnectionUserUseCase).execute;
