import { prisma } from "../../adapters/Prisma/client";
import { GetFunnelKanbanController } from "./Controller";
import { GetFunnelKanbanImplementation } from "./Implementation";
import { GetFunnelKanbanUseCase } from "./UseCase";

const getFunnelKanbanImplementation = new GetFunnelKanbanImplementation(prisma);
const getFunnelKanbanUseCase = new GetFunnelKanbanUseCase(
  getFunnelKanbanImplementation
);

export const getFunnelKanbanController = GetFunnelKanbanController(
  getFunnelKanbanUseCase
).execute;
