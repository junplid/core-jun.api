import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionWAUserController } from "./Controller";
import { GetConnectionWAUserImplementation } from "./Implementation";
import { GetConnectionWAUserUseCase } from "./UseCase";

const getConnectionWAUserImplementation = new GetConnectionWAUserImplementation(
  prisma
);
const getConnectionWAUserUseCase = new GetConnectionWAUserUseCase(
  getConnectionWAUserImplementation
);

export const getConnectionWAUserController = GetConnectionWAUserController(
  getConnectionWAUserUseCase
).execute;
