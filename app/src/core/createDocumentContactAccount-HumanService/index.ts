import { prisma } from "../../adapters/Prisma/client";
import { CreateDocumentContactAccountFileController } from "./Controller";
import { CreateDocumentContactAccountFileImplementation } from "./Implementation";
import { CreateDocumentContactAccountFileUseCase } from "./UseCase";

const createDocumentContactAccountFile =
  new CreateDocumentContactAccountFileImplementation(prisma);
const createDocumentContactAccountFileUseCase =
  new CreateDocumentContactAccountFileUseCase(createDocumentContactAccountFile);

export const createDocumentContactAccountFileController =
  CreateDocumentContactAccountFileController(
    createDocumentContactAccountFileUseCase
  ).execute;
