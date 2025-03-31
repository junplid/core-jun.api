import { prisma } from "../../adapters/Prisma/client";
import { GetDocumentContactAccountFileController } from "./Controller";
import { GetDocumentContactAccountFileImplementation } from "./Implementation";
import { GetDocumentContactAccountFileUseCase } from "./UseCase";

const getDocumentContactAccountFile =
  new GetDocumentContactAccountFileImplementation(prisma);
const getDocumentContactAccountFileUseCase =
  new GetDocumentContactAccountFileUseCase(getDocumentContactAccountFile);

export const getDocumentContactAccountFileController =
  GetDocumentContactAccountFileController(
    getDocumentContactAccountFileUseCase
  ).execute;
