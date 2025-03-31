import { DeleteContactWAImplementation } from "./Implementation";
import { DeleteContactWAController } from "./Controller";
import { DeleteContactWAUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteContactWAImplementation = new DeleteContactWAImplementation(prisma);
const deleteContactWAUseCase = new DeleteContactWAUseCase(
  deleteContactWAImplementation
);

export const deleteContactWAController = DeleteContactWAController(
  deleteContactWAUseCase
).execute;
