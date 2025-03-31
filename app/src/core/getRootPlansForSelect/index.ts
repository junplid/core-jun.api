import { prisma } from "../../adapters/Prisma/client";
import { GetRootPlansForSelectController } from "./Controller";
import { GetRootPlansForSelectImplementation } from "./Implementation";
import { GetRootPlansForSelectUseCase } from "./UseCase";

const getRootPlansForSelectImplementation =
  new GetRootPlansForSelectImplementation(prisma);
const getRootPlansForSelectUseCase = new GetRootPlansForSelectUseCase(
  getRootPlansForSelectImplementation
);

export const getRootPlansForSelectController = GetRootPlansForSelectController(
  getRootPlansForSelectUseCase
).execute;
