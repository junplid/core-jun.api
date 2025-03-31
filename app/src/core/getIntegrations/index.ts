import { prisma } from "../../adapters/Prisma/client";
import { GetIntegrationsController } from "./Controller";
import { GetIntegrationsOnAccountImplementation } from "./Implementation";
import { GetIntegrationsUseCase } from "./UseCase";

const getIntegrationsImplementation =
  new GetIntegrationsOnAccountImplementation(prisma);
const getIntegrationsUseCase = new GetIntegrationsUseCase(
  getIntegrationsImplementation
);

export const getIntegrationsController = GetIntegrationsController(
  getIntegrationsUseCase
).execute;
