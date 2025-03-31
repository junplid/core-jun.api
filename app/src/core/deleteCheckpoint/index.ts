import { prisma } from "../../adapters/Prisma/client";
import { DeleteCheckpointController } from "./Controller";
import { DeleteCheckpointImplementation } from "./Implementation";
import { DeleteCheckpointUseCase } from "./UseCase";

const deleteCheckpointImplementation = new DeleteCheckpointImplementation(
  prisma
);
const deleteCheckpointUseCase = new DeleteCheckpointUseCase(
  deleteCheckpointImplementation
);

export const deleteCheckpointController = DeleteCheckpointController(
  deleteCheckpointUseCase
).execute;
