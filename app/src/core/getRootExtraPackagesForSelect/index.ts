import { prisma } from "../../adapters/Prisma/client";
import { GetRootExtraPackagesForSelectController } from "./Controller";
import { GetRootExtraPackagesForSelectImplementation } from "./Implementation";
import { GetRootExtraPackagesForSelectUseCase } from "./UseCase";

const getRootExtraPackagesForSelectImplementation =
  new GetRootExtraPackagesForSelectImplementation(prisma);
const getRootExtraPackagesForSelectUseCase =
  new GetRootExtraPackagesForSelectUseCase(
    getRootExtraPackagesForSelectImplementation
  );

export const getRootExtraPackagesForSelectController =
  GetRootExtraPackagesForSelectController(
    getRootExtraPackagesForSelectUseCase
  ).execute;
