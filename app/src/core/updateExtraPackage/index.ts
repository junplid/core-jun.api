import { prisma } from "../../adapters/Prisma/client";
import { UpdateExtraPackageController } from "./Controller";
import { UpdateExtraPackageImplementation } from "./Implementation";
import { UpdateExtraPackageUseCase } from "./UseCase";

const updateExtraPackageImplementation = new UpdateExtraPackageImplementation(
  prisma
);
const updateExtraPackageUseCase = new UpdateExtraPackageUseCase(
  updateExtraPackageImplementation
);

export const updateExtraPackageController = UpdateExtraPackageController(
  updateExtraPackageUseCase
).execute;
