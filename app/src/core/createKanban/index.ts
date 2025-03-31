import { prisma } from "../../adapters/Prisma/client";
import { CreateKanbanController } from "./Controller";
import { CraeteKanbanImplementation } from "./Implementation";
import { CreateKanbanUseCase } from "./UseCase";

const createKanbanImplementation = new CraeteKanbanImplementation(prisma);

const createKanbanUseCase = new CreateKanbanUseCase(createKanbanImplementation);

export const createKanbanController =
  CreateKanbanController(createKanbanUseCase).execute;
