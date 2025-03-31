import { CraeteFlowImplementation } from "./Implementation";
import { CreateFlowController } from "./Controller";
import { CreateFlowUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createFlowImplementation = new CraeteFlowImplementation(prisma);
const createFlowUseCase = new CreateFlowUseCase(createFlowImplementation);

export const createFlowController =
  CreateFlowController(createFlowUseCase).execute;
