import { prisma } from "../../adapters/Prisma/client";
import { GetHumanServiceUserController } from "./Controller";
import { GetHumanServiceUserImplementation } from "./Implementation";
import { GetHumanServiceUserUseCase } from "./UseCase";

const getHumanServiceUserImplementation = new GetHumanServiceUserImplementation(
  prisma
);
const getHumanServiceUserUseCase = new GetHumanServiceUserUseCase(
  getHumanServiceUserImplementation
);

export const getHumanServiceUserController = GetHumanServiceUserController(
  getHumanServiceUserUseCase
).execute;
