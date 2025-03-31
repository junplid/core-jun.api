import { prisma } from "../../adapters/Prisma/client";
import { GetExtraPackagesRootController } from "./Controller";
import { GetExtraPackagesRootImplementation } from "./Implementation";
import { GetExtraPackagesRootUseCase } from "./UseCase";

const getExtraPackagesRootImplementation =
  new GetExtraPackagesRootImplementation(prisma);
const getExtraPackagesRootUseCase = new GetExtraPackagesRootUseCase(
  getExtraPackagesRootImplementation
);

export const getExtraPackagesRootController = GetExtraPackagesRootController(
  getExtraPackagesRootUseCase
).execute;
