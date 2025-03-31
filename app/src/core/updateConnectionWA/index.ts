import { prisma } from "../../adapters/Prisma/client";
import { UpdateConnectionWAController } from "./Controller";
import { UpdateConnectionWAImplementation } from "./Implementation";
import { UpdateConnectionWAUseCase } from "./UseCase";

const updateConnectionWAImplementation = new UpdateConnectionWAImplementation(
  prisma
);
const updateConnectionWAUseCase = new UpdateConnectionWAUseCase(
  updateConnectionWAImplementation
);

export const updateConnectionWAController = UpdateConnectionWAController(
  updateConnectionWAUseCase
).execute;
