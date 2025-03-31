import { prisma } from "../../adapters/Prisma/client";
import { DeleteIntegrationController } from "./Controller";
import { DeleteIntegrationImplementation } from "./Implementation";
import { DeleteIntegrationUseCase } from "./UseCase";

const deleteIntegrationImplementation = new DeleteIntegrationImplementation(
  prisma
);
const deleteIntegrationUseCase = new DeleteIntegrationUseCase(
  deleteIntegrationImplementation
);

export const deleteIntegrationController = DeleteIntegrationController(
  deleteIntegrationUseCase
).execute;
