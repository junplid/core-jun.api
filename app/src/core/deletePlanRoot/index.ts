import { DeletePlanImplementation } from "./Implementation";
import { DeletePlanController } from "./Controller";
import { DeletePlanUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deletePlanImplementation = new DeletePlanImplementation(prisma);
const deletePlanUseCase = new DeletePlanUseCase(deletePlanImplementation);

export const deletePlanController =
  DeletePlanController(deletePlanUseCase).execute;
