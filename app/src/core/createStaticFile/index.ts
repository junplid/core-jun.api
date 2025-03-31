import { prisma } from "../../adapters/Prisma/client";
import { CreateStaticFileController } from "./Controller";
import { CreateStaticFileImplementation } from "./Implementation";
import { CreateStaticFileUseCase } from "./UseCase";

const createStaticFile = new CreateStaticFileImplementation(prisma);
const createStaticFileUseCase = new CreateStaticFileUseCase(createStaticFile);

export const createStaticFileController = CreateStaticFileController(
  createStaticFileUseCase
).execute;
