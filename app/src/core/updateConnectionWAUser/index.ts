import { prisma } from "../../adapters/Prisma/client";
import { UpdateConnectionWAUserController } from "./Controller";
import { UpdateConnectionWAUserImplementation } from "./Implementation";
import { UpdateConnectionWAUserUseCase } from "./UseCase";

const updateConnectionWAUserImplementation =
  new UpdateConnectionWAUserImplementation(prisma);
const updateConnectionWAUserUseCase = new UpdateConnectionWAUserUseCase(
  updateConnectionWAUserImplementation
);

export const updateConnectionWAUserController =
  UpdateConnectionWAUserController(updateConnectionWAUserUseCase).execute;
