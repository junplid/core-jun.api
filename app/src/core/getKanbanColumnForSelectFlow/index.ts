import { prisma } from "../../adapters/Prisma/client";
import { GeKanbanColumnForSelectFlowController } from "./Controller";
import { GeKanbanColumnForSelectFlowImplementation } from "./Implementation";
import { GeKanbanColumnForSelectFlowUseCase } from "./UseCase";

const geKanbanColumnForSelectFlowImplementation =
  new GeKanbanColumnForSelectFlowImplementation(prisma);
const geKanbanColumnForSelectFlowUseCase =
  new GeKanbanColumnForSelectFlowUseCase(
    geKanbanColumnForSelectFlowImplementation
  );

export const geKanbanColumnForSelectFlowController =
  GeKanbanColumnForSelectFlowController(
    geKanbanColumnForSelectFlowUseCase
  ).execute;
