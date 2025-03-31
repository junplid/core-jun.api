import { prisma } from "../../adapters/Prisma/client";
import { DeleteSubAccountController } from "./Controller";
import { DeleteSubAccountImplementation } from "./Implementation";
import { DeleteSubAccountUseCase } from "./UseCase";

const deleteSubAccountImplementation = new DeleteSubAccountImplementation(
  prisma
);
const deleteSubAccountUseCase = new DeleteSubAccountUseCase(
  deleteSubAccountImplementation
);

export const deleteSubAccountController = DeleteSubAccountController(
  deleteSubAccountUseCase
).execute;
