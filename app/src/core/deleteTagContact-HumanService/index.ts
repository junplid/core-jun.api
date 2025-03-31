import { DeleteTagContactHumanServiceImplementation } from "./Implementation";
import { DeleteTagContactHumanServiceController } from "./Controller";
import { DeleteTagContactHumanServiceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteTagContactHumanServiceImplementation =
  new DeleteTagContactHumanServiceImplementation(prisma);
const deleteTagContactHumanServiceUseCase =
  new DeleteTagContactHumanServiceUseCase(
    deleteTagContactHumanServiceImplementation
  );

export const deleteTagContactHumanServiceController =
  DeleteTagContactHumanServiceController(
    deleteTagContactHumanServiceUseCase
  ).execute;
