import { CreateOnDemandAudienceImplementation } from "./Implementation";
import { CreateOnDemandAudienceController } from "./Controller";
import { CreateOnDemandAudienceUseCase } from "./UseCase";
import { prisma } from "../../adapters/Prisma/client";

const createOnDemandAudienceImplementation =
  new CreateOnDemandAudienceImplementation(prisma);
const createOnDemandAudienceUseCase = new CreateOnDemandAudienceUseCase(
  createOnDemandAudienceImplementation
);

export const createOnDemandAudienceController =
  CreateOnDemandAudienceController(createOnDemandAudienceUseCase).execute;
