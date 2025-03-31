import { CreateTagContactHumanServiceImplementation } from "./Implementation";
import { CreateTagContactHumanServiceController } from "./Controller";
import { CreateTagContactHumanServiceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createTagContactHumanServiceImplementation =
  new CreateTagContactHumanServiceImplementation(prisma);
const createTagContactHumanServiceUseCase =
  new CreateTagContactHumanServiceUseCase(
    createTagContactHumanServiceImplementation
  );

export const createTagContactHumanServiceController =
  CreateTagContactHumanServiceController(
    createTagContactHumanServiceUseCase
  ).execute;
