import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionsWAController } from "./Controller";
import { GetConnectionsWAImplementation } from "./Implementation";
import { GetConnectionsWAUseCase } from "./UseCase";

const getConnectionsWAImplementation = new GetConnectionsWAImplementation(
  prisma
);
const getConnectionsWAUseCase = new GetConnectionsWAUseCase(
  getConnectionsWAImplementation
);

export const getConnectionsWAController = GetConnectionsWAController(
  getConnectionsWAUseCase
).execute;
