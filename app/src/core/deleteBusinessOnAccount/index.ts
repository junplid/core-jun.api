import { DeleteBusinessOnAccountImplementation } from "./Implementation";
import { DeleteBusinessOnAccountController } from "./Controller";
import { DeleteBusinessOnAccountUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteBusinessOnAccountImplementation =
  new DeleteBusinessOnAccountImplementation(prisma);
const deleteBusinessOnAccountUseCase = new DeleteBusinessOnAccountUseCase(
  deleteBusinessOnAccountImplementation
);

export const deleteBusinessOnAccountController =
  DeleteBusinessOnAccountController(deleteBusinessOnAccountUseCase).execute;
