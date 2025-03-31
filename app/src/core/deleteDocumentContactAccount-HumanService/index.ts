import { prisma } from "../../adapters/Prisma/client";
import { DeleteDocumentContactAccountFileController } from "./Controller";
import { DeleteDocumentContactAccountFileImplementation } from "./Implementation";
import { DeleteDocumentContactAccountFileUseCase } from "./UseCase";

const deleteDocumentContactAccountFile =
  new DeleteDocumentContactAccountFileImplementation(prisma);
const deleteDocumentContactAccountFileUseCase =
  new DeleteDocumentContactAccountFileUseCase(deleteDocumentContactAccountFile);

export const deleteDocumentContactAccountFileController =
  DeleteDocumentContactAccountFileController(
    deleteDocumentContactAccountFileUseCase
  ).execute;
