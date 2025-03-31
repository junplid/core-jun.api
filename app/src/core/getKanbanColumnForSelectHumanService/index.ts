import { prisma } from "../../adapters/Prisma/client";
import { GeKanbanColumnForSelectHumanServiceController } from "./Controller";
import { GeKanbanColumnForSelectHumanServiceImplementation } from "./Implementation";
import { GeKanbanColumnForSelectHumanServiceUseCase } from "./UseCase";

const geKanbanColumnForSelectHumanServiceImplementation =
  new GeKanbanColumnForSelectHumanServiceImplementation(prisma);
const geKanbanColumnForSelectHumanServiceUseCase =
  new GeKanbanColumnForSelectHumanServiceUseCase(
    geKanbanColumnForSelectHumanServiceImplementation
  );

export const geKanbanColumnForSelectHumanServiceController =
  GeKanbanColumnForSelectHumanServiceController(
    geKanbanColumnForSelectHumanServiceUseCase
  ).execute;
