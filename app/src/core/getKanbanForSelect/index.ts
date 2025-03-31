import { prisma } from "../../adapters/Prisma/client";
import { GetKanbanForSelectController } from "./Controller";
import { GetKanbanForSelectImplementation } from "./Implementation";
import { GetKanbanForSelectUseCase } from "./UseCase";

const getKanbanForSelectImplementation = new GetKanbanForSelectImplementation(
  prisma
);
const getKanbanForSelectUseCase = new GetKanbanForSelectUseCase(
  getKanbanForSelectImplementation
);

export const getKanbanForSelectController = GetKanbanForSelectController(
  getKanbanForSelectUseCase
).execute;
