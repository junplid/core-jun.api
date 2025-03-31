import { CreateTagHumanServiceImplementation } from "./Implementation";
import { CreateTagHumanServiceController } from "./Controller";
import { CreateTagHumanServiceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createTagHumanServiceImplementation =
  new CreateTagHumanServiceImplementation(prisma);
const createTagHumanServiceUseCase = new CreateTagHumanServiceUseCase(
  createTagHumanServiceImplementation
);

export const createTagHumanServiceController = CreateTagHumanServiceController(
  createTagHumanServiceUseCase
).execute;
