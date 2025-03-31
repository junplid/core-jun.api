import { prisma } from "../../adapters/Prisma/client";
import { GetExtraPackageController } from "./Controller";
import { GetExtraPackageImplementation } from "./Implementation";
import { GetExtraPackageUseCase } from "./UseCase";

const getExtraPackageImplementation = new GetExtraPackageImplementation(prisma);
const getExtraPackageUseCase = new GetExtraPackageUseCase(
  getExtraPackageImplementation
);

export const getExtraPackageController = GetExtraPackageController(
  getExtraPackageUseCase
).execute;
