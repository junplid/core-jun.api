import { GetPlansRootImplementation } from "./Implementation";
import { GetPlansRootController } from "./Controller";
import { GetPlansRootUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getPlansRootImplementation = new GetPlansRootImplementation(prisma);
const getPlansRootUseCase = new GetPlansRootUseCase(getPlansRootImplementation);

export const getPlansRootController =
  GetPlansRootController(getPlansRootUseCase).execute;
