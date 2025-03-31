import { prisma } from "../../adapters/Prisma/client";
import { GetIntegrationsForSelectController } from "./Controller";
import { GetIntegrationsForSelectImplementation } from "./Implementation";
import { GetIntegrationsForSelectUseCase } from "./UseCase";

const getIntegrationsForSelectImplementation =
  new GetIntegrationsForSelectImplementation(prisma);
const getIntegrationsForSelectUseCase = new GetIntegrationsForSelectUseCase(
  getIntegrationsForSelectImplementation
);

export const getIntegrationsForSelectController =
  GetIntegrationsForSelectController(getIntegrationsForSelectUseCase).execute;
