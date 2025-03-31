import { prisma } from "../../adapters/Prisma/client";
import { CreateIntegrationController } from "./Controller";
import { CraeteSectorImplementation } from "./Implementation";
import { CreateIntegrationUseCase } from "./UseCase";

const createIntegrationImplementation = new CraeteSectorImplementation(prisma);

const createIntegrationUseCase = new CreateIntegrationUseCase(
  createIntegrationImplementation
);

export const createIntegrationController = CreateIntegrationController(
  createIntegrationUseCase
).execute;
