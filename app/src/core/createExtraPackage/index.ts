import { prisma } from "../../adapters/Prisma/client";
import { CreateExtraPackageController } from "./Controller";
import { CraeteCompanyImplementation } from "./Implementation";
import { CreateExtraPackageUseCase } from "./UseCase";

const createExtraPackageImplementation = new CraeteCompanyImplementation(
  prisma
);
const createExtraPackageUseCase = new CreateExtraPackageUseCase(
  createExtraPackageImplementation
);

export const createExtraPackageController = CreateExtraPackageController(
  createExtraPackageUseCase
).execute;
