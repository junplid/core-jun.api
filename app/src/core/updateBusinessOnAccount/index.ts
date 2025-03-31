import { prisma } from "../../adapters/Prisma/client";
import { UpdateBusinessOnAccountController } from "./Controller";
import { UpdateBusinessOnAccountImplementation } from "./Implementation";
import { UpdateBusinessOnAccountUseCase } from "./UseCase";

const updateBusinessOnAccountImplementation =
  new UpdateBusinessOnAccountImplementation(prisma);
const updateBusinessOnAccountUseCase = new UpdateBusinessOnAccountUseCase(
  updateBusinessOnAccountImplementation
);

export const updateBusinessOnAccountController =
  UpdateBusinessOnAccountController(updateBusinessOnAccountUseCase).execute;
