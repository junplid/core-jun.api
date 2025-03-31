import { CraeteSectorImplementation } from "./Implementation";
import { CreateSectorController } from "./Controller";
import { CreateSectorUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createSectorImplementation = new CraeteSectorImplementation(prisma);

const createSectorUseCase = new CreateSectorUseCase(createSectorImplementation);

export const createSectorController =
  CreateSectorController(createSectorUseCase).execute;
