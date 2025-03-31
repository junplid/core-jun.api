import { DeleteBatchSupervisorImplementation } from "./Implementation";
import { DeleteBatchSupervisorController } from "./Controller";
import { DeleteBatchSupervisorUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteBatchSupervisorImplementation =
  new DeleteBatchSupervisorImplementation(prisma);
const deleteBatchSupervisorUseCase = new DeleteBatchSupervisorUseCase(
  deleteBatchSupervisorImplementation
);

export const deleteBatchSupervisorController = DeleteBatchSupervisorController(
  deleteBatchSupervisorUseCase
).execute;
