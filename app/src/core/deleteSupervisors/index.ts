import { DeleteSupervisorImplementation } from "./Implementation";
import { DeleteSupervisorController } from "./Controller";
import { DeleteSupervisorUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteSupervisorImplementation = new DeleteSupervisorImplementation(
  prisma
);
const deleteSupervisorUseCase = new DeleteSupervisorUseCase(
  deleteSupervisorImplementation
);

export const deleteSupervisorController = DeleteSupervisorController(
  deleteSupervisorUseCase
).execute;
