import { prisma } from "../../adapters/Prisma/client";
import { UpdateFunnelKanbanTicketController } from "./Controller";
import { UpdateFunnelKanbanTicketImplementation } from "./Implementation";
import { UpdateFunnelKanbanTicketUseCase } from "./UseCase";

const updateFunnelKanbanTicketImplementation =
  new UpdateFunnelKanbanTicketImplementation(prisma);
const updateFunnelKanbanTicketUseCase = new UpdateFunnelKanbanTicketUseCase(
  updateFunnelKanbanTicketImplementation
);

export const updateFunnelKanbanTicketController =
  UpdateFunnelKanbanTicketController(updateFunnelKanbanTicketUseCase).execute;
