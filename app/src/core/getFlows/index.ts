import { GetFlowsImplementation } from "./Implementation";
import { GetFlowsController } from "./Controller";
import { GetFlowsUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const getFlowsImplementation = new GetFlowsImplementation(prisma);
const getFlowsUseCase = new GetFlowsUseCase(getFlowsImplementation);

export const getFlowsController = GetFlowsController(getFlowsUseCase).execute;
