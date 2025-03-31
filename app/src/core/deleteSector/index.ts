import { DeleteSectorImplementation } from "./Implementation";
import { DeleteSectorController } from "./Controller";
import { DeleteSectorUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteSectorImplementation = new DeleteSectorImplementation(prisma);
const deleteSectorUseCase = new DeleteSectorUseCase(deleteSectorImplementation);

export const deleteSectorController =
  DeleteSectorController(deleteSectorUseCase).execute;
