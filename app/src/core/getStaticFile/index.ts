import { prisma } from "../../adapters/Prisma/client";
import { GetStaticFileController } from "./Controller";
import { GetStaticFileImplementation } from "./Implementation";
import { GetStaticFileUseCase } from "./UseCase";

const getStaticFile = new GetStaticFileImplementation(prisma);
const getStaticFileUseCase = new GetStaticFileUseCase(getStaticFile);

export const getStaticFileController =
  GetStaticFileController(getStaticFileUseCase).execute;
