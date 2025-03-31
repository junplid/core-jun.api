import { CreateSupervisorImplementation } from "./Implementation";
import { CreateSupervisorController } from "./Controller";
import { CreateSupervisorUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createSupervisorImplementation = new CreateSupervisorImplementation(
  prisma
);
const createSupervisorUseCase = new CreateSupervisorUseCase(
  createSupervisorImplementation
);

export const createSupervisorController = CreateSupervisorController(
  createSupervisorUseCase
).execute;
