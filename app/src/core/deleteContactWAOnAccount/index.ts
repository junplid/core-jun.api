import { DeleteContactWAOnAccountOnAccountImplementation } from "./Implementation";
import { DeleteContactWAOnAccountOnAccountController } from "./Controller";
import { DeleteContactWAOnAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteContactWAOnAccountImplementation =
  new DeleteContactWAOnAccountOnAccountImplementation(prisma);
const deleteContactWAOnAccountUseCase = new DeleteContactWAOnAccountUseCase(
  deleteContactWAOnAccountImplementation
);

export const deleteContactWAOnAccountController =
  DeleteContactWAOnAccountOnAccountController(
    deleteContactWAOnAccountUseCase
  ).execute;
