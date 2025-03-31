import { GeSupervisorsForSelectImplementation } from "./Implementation";
import { GeSupervisorsForSelectController } from "./Controller";
import { GeSupervisorsForSelectUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const geSupervisorsForSelectImplementation =
  new GeSupervisorsForSelectImplementation(prisma);
const geSupervisorsForSelectUseCase = new GeSupervisorsForSelectUseCase(
  geSupervisorsForSelectImplementation
);

export const geSupervisorsForSelectController =
  GeSupervisorsForSelectController(geSupervisorsForSelectUseCase).execute;
