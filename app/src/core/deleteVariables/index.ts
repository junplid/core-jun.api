import { DeleteVariableImplementation } from "./Implementation";
import { DeleteVariableController } from "./Controller";
import { DeleteVariableUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const deleteVariableImplementation = new DeleteVariableImplementation(prisma);
const deleteVariableUseCase = new DeleteVariableUseCase(
  deleteVariableImplementation
);

export const deleteVariableController = DeleteVariableController(
  deleteVariableUseCase
).execute;
