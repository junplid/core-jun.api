import { prisma } from "../../adapters/Prisma/client";
import { UpdateFunnelKanbanTicketForSelectController } from "./Controller";
import { UpdateFunnelKanbanTicketForSelectImplementation } from "./Implementation";
import { UpdateFunnelKanbanTicketForSelectUseCase } from "./UseCase";

const updateFunnelKanbanTicketForSelectImplementation =
  new UpdateFunnelKanbanTicketForSelectImplementation(prisma);
const updateFunnelKanbanTicketForSelectUseCase =
  new UpdateFunnelKanbanTicketForSelectUseCase(
    updateFunnelKanbanTicketForSelectImplementation
  );

export const updateFunnelKanbanTicketForSelectController =
  UpdateFunnelKanbanTicketForSelectController(
    updateFunnelKanbanTicketForSelectUseCase
  ).execute;
