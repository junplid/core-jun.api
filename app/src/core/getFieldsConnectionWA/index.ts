import { prisma } from "../../adapters/Prisma/client";
import { GetFieldsConnectionWAController } from "./Controller";
import { GetFieldsConnectionWAImplementation } from "./Implementation";
import { GetFieldsConnectionWAUseCase } from "./UseCase";

const getFieldsConnectionWAImplementation =
  new GetFieldsConnectionWAImplementation(prisma);
const getFieldsConnectionWAUseCase = new GetFieldsConnectionWAUseCase(
  getFieldsConnectionWAImplementation
);

export const getFieldsConnectionWAController = GetFieldsConnectionWAController(
  getFieldsConnectionWAUseCase
).execute;
