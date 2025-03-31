import { prisma } from "../../adapters/Prisma/client";
import { UpdatePasswordAccountController } from "./Controller";
import { UpdatePasswordAccountImplementation } from "./Implementation";
import { UpdatePasswordAccountUseCase } from "./UseCase";

const updatePasswordAccountImplementation =
  new UpdatePasswordAccountImplementation(prisma);
const updatePasswordAccountUseCase = new UpdatePasswordAccountUseCase(
  updatePasswordAccountImplementation
);

export const updatePasswordAccountController = UpdatePasswordAccountController(
  updatePasswordAccountUseCase
).execute;
