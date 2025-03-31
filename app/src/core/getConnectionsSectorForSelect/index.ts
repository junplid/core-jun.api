import { prisma } from "../../adapters/Prisma/client";
import { GetConnectionsSectorForSelectController } from "./Controller";
import { GetConnectionsSectorForSelectImplementation } from "./Implementation";
import { GetConnectionsSectorForSelectUseCase } from "./UseCase";

const getConnectionsSectorForSelectImplementation =
  new GetConnectionsSectorForSelectImplementation(prisma);
const getConnectionsSectorForSelectUseCase =
  new GetConnectionsSectorForSelectUseCase(
    getConnectionsSectorForSelectImplementation
  );

export const getConnectionsSectorForSelectController =
  GetConnectionsSectorForSelectController(
    getConnectionsSectorForSelectUseCase
  ).execute;
