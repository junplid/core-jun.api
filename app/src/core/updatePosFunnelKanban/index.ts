import { prisma } from "../../adapters/Prisma/client";
import { UpdatePosFunnelKanbanController } from "./Controller";
import { UpdatePosFunnelKanbanImplementation } from "./Implementation";
import { UpdatePosFunnelKanbanUseCase } from "./UseCase";

const updatePosFunnelKanbanImplementation =
  new UpdatePosFunnelKanbanImplementation(prisma);
const updatePosFunnelKanbanUseCase = new UpdatePosFunnelKanbanUseCase(
  updatePosFunnelKanbanImplementation
);

export const updatePosFunnelKanbanController = UpdatePosFunnelKanbanController(
  updatePosFunnelKanbanUseCase
).execute;
