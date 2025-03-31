import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionWAController } from "./Controller";
import { GetConnectionWAImplementation } from "./Implementation";
import { GetConnectionWAUseCase } from "./UseCase";

const getConnectionWAImplementation = new GetConnectionWAImplementation(prisma);
const getConnectionWAUseCase = new GetConnectionWAUseCase(
  getConnectionWAImplementation
);

export const getConnectionWAController = GetConnectionWAController(
  getConnectionWAUseCase
).execute;
