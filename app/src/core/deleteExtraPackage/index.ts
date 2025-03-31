import { prisma } from "../../adapters/Prisma/client";
import { DeleteExtraPackageController } from "./Controller";
import { DeleteExtraPackageImplementation } from "./Implementation";
import { DeleteExtraPackageUseCase } from "./UseCase";

const deleteExtraPackageImplementation = new DeleteExtraPackageImplementation(
  prisma
);
const deleteExtraPackageUseCase = new DeleteExtraPackageUseCase(
  deleteExtraPackageImplementation
);

export const deleteExtraPackageController = DeleteExtraPackageController(
  deleteExtraPackageUseCase
).execute;
