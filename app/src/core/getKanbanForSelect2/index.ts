import { prisma } from "../../adapters/Prisma/client";
import { GeKanbanForSelectController } from "./Controller";
import { GeKanbanForSelectImplementation } from "./Implementation";
import { GeKanbanForSelectUseCase } from "./UseCase";

const geKanbanForSelectImplementation = new GeKanbanForSelectImplementation(
  prisma
);
const geKanbanForSelectUseCase = new GeKanbanForSelectUseCase(
  geKanbanForSelectImplementation
);

export const geKanbanForSelectController = GeKanbanForSelectController(
  geKanbanForSelectUseCase
).execute;
