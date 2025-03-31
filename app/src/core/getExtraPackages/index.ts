import { prisma } from "../../adapters/Prisma/client";
import { GetExtraPackagesController } from "./Controller";
import { GetExtraPackagesImplementation } from "./Implementation";
import { GetExtraPackagesUseCase } from "./UseCase";

const getExtraPackagesImplementation = new GetExtraPackagesImplementation(
  prisma
);
const getExtraPackagesUseCase = new GetExtraPackagesUseCase(
  getExtraPackagesImplementation
);

export const getExtraPackagesController = GetExtraPackagesController(
  getExtraPackagesUseCase
).execute;
